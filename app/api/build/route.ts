import { NextResponse } from 'next/server';
import { Octokit } from 'octokit';

export async function POST(req: Request) {
  const { modFiles, modId } = await req.json();

  if (!process.env.GH_TOKEN) {
    return NextResponse.json({ error: 'GH_TOKEN is not set' }, { status: 500 });
  }

  const repoFull = process.env.GITHUB_REPO || 'diddy62626/Minecraft-Fabric-1.21.11-Mod-Generator';
  const [owner, repo] = repoFull.split('/');
  const ref = process.env.GITHUB_BRANCH || 'main';

  const octokit = new Octokit({ auth: process.env.GH_TOKEN });

  try {
    // Trigger the workflow
    await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
      owner,
      repo,
      workflow_id: 'build-mod.yml',
      ref,
      inputs: {
        mod_files_json: JSON.stringify(modFiles),
        mod_id: modId
      },
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });

    return NextResponse.json({ success: true, owner, repo, ref });
  } catch (error: any) {
    console.error('GitHub Action trigger failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
