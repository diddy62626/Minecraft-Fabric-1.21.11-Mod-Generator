'use client';

import { useState } from 'react';
import { generateModZip } from '@/utils/generator';
import { Download, Loader2, Hammer, Code, Zap, Settings, Book, Info } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    modName: 'My Epic Mod',
    modId: 'my_epic_mod',
    modVersion: '1.0.0',
    mavenGroup: 'com.example',
    description: 'A mod that adds epic things.',
    prompt: 'Add a new item called "Epic Gem" that gives the player strength when held.',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const blob = await generateModZip({
        ...formData,
        extraFiles: data.files,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = formData.modId + "-" + formData.modVersion + ".zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert('Error generating mod: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Navigation */}
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
             <button className="p-2 text-zinc-400 hover:text-zinc-100"><Settings className="w-5 h-5" /></button>
             <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold uppercase tracking-wider mb-4">
            <Zap className="w-3 h-3" /> Minecraft 1.21.1 Supported
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tight leading-tight">
            Create your next mod <br />
            <span className="text-zinc-500">in seconds</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Configure your Fabric project and let our AI engine generate the boilerplate and features for you.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Project Details Section */}
          <section className="bg-zinc-900/30 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-8 text-orange-500 uppercase text-xs font-black tracking-widest">
              <Settings className="w-4 h-4" /> Project Details
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 md:col-span-2">
                <label htmlFor="modName" className="block text-sm font-bold text-zinc-400">Mod Name</label>
                <input
                  id="modName"
                  type="text"
                  name="modName"
                  value={formData.modName}
                  onChange={handleChange}
                  placeholder="e.g. Emerald Tools Expanded"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 focus:ring-2 focus:ring-orange-600 outline-none transition-all placeholder:text-zinc-700"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="modId" className="block text-sm font-bold text-zinc-400">Mod ID</label>
                <input
                  id="modId"
                  type="text"
                  name="modId"
                  value={formData.modId}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 focus:ring-2 focus:ring-orange-600 outline-none transition-all"
                  required
                />
                <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-tighter">Lowercase & underscores only</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="modVersion" className="block text-sm font-bold text-zinc-400">Version</label>
                <input
                  id="modVersion"
                  type="text"
                  name="modVersion"
                  value={formData.modVersion}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 focus:ring-2 focus:ring-orange-600 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="mavenGroup" className="block text-sm font-bold text-zinc-400">Maven Group</label>
                <input
                  id="mavenGroup"
                  type="text"
                  name="mavenGroup"
                  value={formData.mavenGroup}
                  onChange={handleChange}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 focus:ring-2 focus:ring-orange-600 outline-none transition-all"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="description" className="block text-sm font-bold text-zinc-400">Mod Description</label>
                <input
                  id="description"
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Briefly describe what this mod does..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-3 focus:ring-2 focus:ring-orange-600 outline-none transition-all placeholder:text-zinc-700"
                  required
                />
              </div>
            </div>
          </section>

          {/* Features Prompt Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-orange-500 uppercase text-xs font-black tracking-widest">
                <Code className="w-4 h-4" /> Features Prompt
              </div>
              <div className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase font-bold">AI Enhanced</div>
            </div>

            <div className="relative group">
               <textarea
                id="prompt"
                name="prompt"
                value={formData.prompt}
                onChange={handleChange}
                rows={6}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-6 focus:ring-2 focus:ring-orange-600 outline-none transition-all resize-none placeholder:text-zinc-700 font-mono text-sm leading-relaxed"
                placeholder="Describe the mod features... e.g. Add a new ore called Ruby that spawns in the Nether and can be used to craft high-durability armor."
                required
              />
              <div className="absolute bottom-4 right-4 text-zinc-700 group-focus-within:text-orange-900/50">
                <Code className="w-6 h-6" />
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black py-5 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-lg shadow-orange-900/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                GENERATING MOD CORE...
              </>
            ) : (
              <>
                <Hammer className="w-6 h-6" />
                GENERATE & DOWNLOAD MOD ZIP
              </>
            )}
          </button>
        </form>
      </main>

      <footer className="mt-24 border-t border-zinc-900 py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-zinc-500 text-xs font-medium">
           <div className="flex items-center gap-8">
             <a href="#" className="hover:text-zinc-300">Home</a>
             <a href="#" className="hover:text-zinc-300">My Mods</a>
             <a href="#" className="hover:text-zinc-300">Wiki</a>
             <a href="#" className="hover:text-zinc-300">Settings</a>
           </div>
           <p>© 2026 FabricGen. Java 21 & Fabric Loader required.</p>
        </div>
      </footer>
    </div>
  );
}
