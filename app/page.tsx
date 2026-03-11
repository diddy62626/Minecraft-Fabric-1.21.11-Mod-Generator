'use client';

import { useState } from 'react';
import { generateModZip } from '@/utils/generator';
import { FABRIC_TEMPLATES } from '@/utils/templates';
import { Download, Loader2, Hammer, Code, Zap, Settings, Book, Info, Plus, RotateCcw } from 'lucide-react';

interface ModFile {
  path: string;
  content: string;
  encoding?: 'base64' | 'utf-8';
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [generatedFiles, setGeneratedFiles] = useState<ModFile[]>([]);
  const [formData, setFormData] = useState({
    modName: 'My Epic Mod',
    modId: 'my_epic_mod',
    modVersion: '1.0.0',
    mavenGroup: 'com.example',
    description: 'A mod that adds epic things.',
    prompt: 'Add a new item called "Epic Gem" that gives the player strength when held. Also generate a shiny purple texture for it.',
  });

  const getBaseTemplates = () => {
    const { modId, modName, modVersion, mavenGroup, description } = formData;
    return [
      { path: 'build.gradle', content: FABRIC_TEMPLATES.buildGradle(modId, modVersion, mavenGroup) },
      { path: 'fabric.mod.json', content: FABRIC_TEMPLATES.fabricModJson(modId, modName, description, mavenGroup) },
      { path: 'gradle.properties', content: FABRIC_TEMPLATES.gradleProperties(modId) }
    ];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          currentFiles: generatedFiles,
          baseTemplates: getBaseTemplates()
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Merge or update files
      const newFiles = [...generatedFiles];
      if (data.files) {
        data.files.forEach((file: ModFile) => {
          const index = newFiles.findIndex(f => f.path === file.path);
          if (index !== -1) {
            newFiles[index] = file;
          } else {
            newFiles.push(file);
          }
        });
      }
      setGeneratedFiles(newFiles);

    } catch (error: any) {
      alert('Error generating mod: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const blob = await generateModZip({
      ...formData,
      extraFiles: generatedFiles,
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = formData.modId + "-" + formData.modVersion + ".zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setGeneratedFiles([]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 p-1.5 rounded-lg">
              <Hammer className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">FabricGen</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#" className="text-orange-500 underline underline-offset-8 decoration-2">Generator</a>
            <a href="#" className="hover:text-zinc-200 transition-colors">Documentation</a>
            <a href="#" className="hover:text-zinc-200 transition-colors">Examples</a>
            <a href="#" className="hover:text-zinc-200 transition-colors">Support</a>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={handleReset} className="p-2 text-zinc-400 hover:text-zinc-100" title="Reset Generation"><RotateCcw className="w-5 h-5" /></button>
             <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-wider mb-4">
            <Zap className="w-3 h-3" /> Minecraft 1.21.11 Supported
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight">
            Iterative Mod <br />
            <span className="text-zinc-500">Generator</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Describe features step-by-step. The AI will generate code, JSON, and textures, and refine them as you go.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-12">
          <form onSubmit={handleSubmit} className="space-y-8">
            <section className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl">
              <div className="flex items-center gap-2 mb-8 text-orange-500 uppercase text-xs font-black tracking-widest">
                <Settings className="w-4 h-4" /> Project Settings
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="modName"
                    value={formData.modName}
                    onChange={handleChange}
                    placeholder="Mod Name"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 focus:ring-2 focus:ring-orange-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="modId"
                    value={formData.modId}
                    onChange={handleChange}
                    placeholder="Mod ID"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 focus:ring-2 focus:ring-orange-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="mavenGroup"
                    value={formData.mavenGroup}
                    onChange={handleChange}
                    placeholder="Maven Group"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 focus:ring-2 focus:ring-orange-600 outline-none transition-all"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-500 uppercase text-xs font-black tracking-widest">
                  <Plus className="w-4 h-4" /> Add or Modify Features
                </div>
                <div className="text-[10px] text-zinc-500">FILES GENERATED: {generatedFiles.length}</div>
              </div>

              <div className="relative group">
                <textarea
                  name="prompt"
                  value={formData.prompt}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-6 focus:ring-2 focus:ring-orange-600 outline-none transition-all resize-none font-mono text-sm leading-relaxed"
                  placeholder="Ask for new features or changes to existing ones..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-zinc-100 hover:bg-white text-zinc-950 font-black py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      GENERATE / UPDATE
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={generatedFiles.length === 0}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-black py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:bg-zinc-800"
                >
                  <Download className="w-5 h-5" />
                  DOWNLOAD ZIP
                </button>
              </div>
            </section>
          </form>

          {generatedFiles.length > 0 && (
            <section className="bg-zinc-900/20 border border-zinc-800 p-8 rounded-3xl">
               <div className="flex items-center gap-2 mb-6 text-zinc-500 uppercase text-xs font-black tracking-widest">
                <Code className="w-4 h-4" /> File Overview
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {generatedFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between py-2 px-4 bg-zinc-900 rounded-lg text-xs font-mono border border-zinc-800/50">
                    <span className="text-zinc-400 truncate mr-4">{file.path}</span>
                    <span className="text-orange-500/50 uppercase text-[8px] font-bold">{file.encoding === 'base64' ? 'Texture' : 'Code'}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="mt-24 border-t border-zinc-900 py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-zinc-500 text-xs font-medium">
           <p>© 2026 FabricGen. Java 21 & Fabric Loader 0.16.5 required.</p>
           <p className="text-zinc-700">Llama-3.3-70b-versatile Engine Active</p>
        </div>
      </footer>
    </div>
  );
}
