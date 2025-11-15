import { SLTLanguagePack } from "./types";

export class LanguageLoader {
  private languages: Map<string, SLTLanguagePack> = new Map();

  register(pack: SLTLanguagePack) {
    this.languages.set(pack.iso, pack);
  }

  get(iso: string): SLTLanguagePack | undefined {
    return this.languages.get(iso);
  }

  // Auto-load packs from workspace
  autoDetect() {
    // Stub — in real build, we glob installed @slt-lang/* packages.
    return Array.from(this.languages.values());
  }
}
