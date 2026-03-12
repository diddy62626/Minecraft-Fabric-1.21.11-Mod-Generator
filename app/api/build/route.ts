import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';

export async function POST(req: Request) {
  const { modFiles, modId } = await req.json();

  if (!process.env.GH_TOKEN) {
    return NextResponse.json({ error: 'GH_TOKEN is not set' }, { status: 500 });
  }

  const repoFull = process.env.GITHUB_REPO || 'diddy62626/Minecraft-Fabric-1.21.11-Mod-Generator';
  const [owner, repo] = repoFull.split('/');

  const octokit = new Octokit({ auth: process.env.GH_TOKEN });

  try {
    // Trigger the workflow
    const response = await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
      owner,
      repo,
      workflow_id: 'build-mod.yml',
      ref: 'main',
      inputs: {
        mod_files_json: JSON.stringify(modFiles),
        mod_id: modId
      },
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    // To get the run_id, we usually have to wait a few seconds and poll the runs list
    // because dispatch doesn't return the run_id immediately.
    // For now, we'll return success and the frontend will poll for the latest run.

    return NextResponse.json({ success: true, owner, repo });
  } catch (error: any) {
    console.error('GitHub Action trigger failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
