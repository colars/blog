import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const publicPostsDir = join(projectRoot, "src", "content", "posts");
const contentRoot = join(projectRoot, ".content");
const outputPostsDir = join(contentRoot, "posts");
const cacheDir = join(contentRoot, ".cache");

async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      return error.code !== "ENOENT";
    }
    throw error;
  }
}

async function isDirectory(path) {
  try {
    return (await stat(path)).isDirectory();
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      return error.code !== "ENOENT";
    }
    throw error;
  }
}

async function listMarkdownFiles(directory, base = directory) {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listMarkdownFiles(absolutePath, base)));
    } else if (/\.(md|mdx)$/i.test(entry.name)) {
      files.push(absolutePath.slice(base.length + 1));
    }
  }

  return files;
}

async function mergeDirectory(sourceDir, targetDir) {
  const entries = await readdir(sourceDir, { withFileTypes: true });
  await mkdir(targetDir, { recursive: true });

  for (const entry of entries) {
    const sourcePath = join(sourceDir, entry.name);
    const targetPath = join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await mergeDirectory(sourcePath, targetPath);
      continue;
    }

    if (await pathExists(targetPath)) {
      throw new Error(
        `Private content conflicts with an existing public file: ${targetPath.slice(projectRoot.length + 1)}`,
      );
    }

    await cp(sourcePath, targetPath);
  }
}

function normalizeRepository(repository) {
  const trimmed = repository.trim();

  if (/^[\w.-]+\/[\w.-]+$/.test(trimmed)) {
    return trimmed;
  }

  const url = new URL(trimmed);
  if (url.hostname !== "github.com") {
    throw new Error("BLOG_CONTENT_REPO must point to a github.com repository.");
  }

  const parts = url.pathname.replace(/^\/|\/$/g, "").replace(/\.git$/, "").split("/");
  if (parts.length !== 2) {
    throw new Error("BLOG_CONTENT_REPO must use the owner/repository format.");
  }

  return parts.join("/");
}

async function prepareLocalPrivateContent(directory) {
  const resolvedDirectory = resolve(projectRoot, directory);
  const nestedPostsDirectory = join(resolvedDirectory, "posts");
  const sourceDirectory = (await isDirectory(nestedPostsDirectory))
    ? nestedPostsDirectory
    : resolvedDirectory;

  if (!(await isDirectory(sourceDirectory))) {
    throw new Error(`BLOG_CONTENT_DIR does not exist: ${sourceDirectory}`);
  }

  await mergeDirectory(sourceDirectory, outputPostsDir);
}

async function prepareRemotePrivateContent(repository, token, ref) {
  const normalizedRepository = normalizeRepository(repository);
  const archivePath = join(cacheDir, "content.tar.gz");
  const extractionDir = join(cacheDir, "extracted");
  const apiUrl = `https://api.github.com/repos/${normalizedRepository}/tarball/${encodeURIComponent(ref)}`;

  await rm(cacheDir, { recursive: true, force: true });
  await mkdir(cacheDir, { recursive: true });

  const response = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "en-personal-essays-build",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(
      `Unable to download private content repository (${response.status}). Check CONTENT_REPO_TOKEN and repository access.`,
    );
  }

  await writeFile(archivePath, Buffer.from(await response.arrayBuffer()));
  await mkdir(extractionDir, { recursive: true });

  const tarResult = spawnSync(
    "tar",
    ["-xzf", archivePath, "-C", extractionDir, "--strip-components=1"],
    { encoding: "utf8" },
  );

  if (tarResult.error) {
    throw new Error(`Unable to extract private content archive: ${tarResult.error.message}`);
  }

  if (tarResult.status !== 0) {
    throw new Error(
      `Unable to extract private content archive: ${(tarResult.stderr || "").trim()}`,
    );
  }

  const sourceDirectory = join(extractionDir, "posts");
  if (!(await isDirectory(sourceDirectory))) {
    throw new Error('The private content repository must contain a "posts/" directory.');
  }

  await mergeDirectory(sourceDirectory, outputPostsDir);
  await rm(cacheDir, { recursive: true, force: true });
}

async function main() {
  const envFile = join(projectRoot, ".env");
  if (await pathExists(envFile)) {
    process.loadEnvFile(envFile);
  }

  if (!(await isDirectory(publicPostsDir))) {
    throw new Error(`Public posts directory does not exist: ${publicPostsDir}`);
  }

  await rm(outputPostsDir, { recursive: true, force: true });
  await mkdir(outputPostsDir, { recursive: true });
  await cp(publicPostsDir, outputPostsDir, { recursive: true });

  const publicCount = (await listMarkdownFiles(outputPostsDir)).length;
  const localDirectory = process.env.BLOG_CONTENT_DIR?.trim();
  const repository = process.env.BLOG_CONTENT_REPO?.trim();
  const token = process.env.CONTENT_REPO_TOKEN?.trim();
  const ref = process.env.BLOG_CONTENT_REF?.trim() || "main";
  let privateCount = 0;

  if (localDirectory && repository) {
    throw new Error("Set only one of BLOG_CONTENT_DIR or BLOG_CONTENT_REPO.");
  }

  if (localDirectory) {
    await prepareLocalPrivateContent(localDirectory);
    privateCount =
      (await listMarkdownFiles(outputPostsDir)).length - publicCount;
    console.log(`[content] Merged ${privateCount} private post(s) from BLOG_CONTENT_DIR.`);
  } else if (repository) {
    if (!token) {
      throw new Error("CONTENT_REPO_TOKEN is required when BLOG_CONTENT_REPO is set.");
    }

    await prepareRemotePrivateContent(repository, token, ref);
    privateCount =
      (await listMarkdownFiles(outputPostsDir)).length - publicCount;
    console.log(
      `[content] Merged ${privateCount} private post(s) from ${repository}@${ref}.`,
    );
  } else {
    console.log("[content] Private content is not configured; using public posts only.");
  }

  console.log(`[content] Ready with ${publicCount + privateCount} total post(s).`);
}

main().catch((error) => {
  console.error(`[content] ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
