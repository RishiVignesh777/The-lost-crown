import { Quest, INITIAL_QUESTS } from '../data/quests';

export class QuestSystem {
  private quests: Map<string, Quest> = new Map();
  public discoveredChronicles: Set<string> = new Set();

  constructor(savedQuests?: Quest[]) {
    if (savedQuests && savedQuests.length > 0) {
      savedQuests.forEach(q => this.quests.set(q.id, JSON.parse(JSON.stringify(q))));
    } else {
      INITIAL_QUESTS.forEach(q => this.quests.set(q.id, JSON.parse(JSON.stringify(q))));
    }
  }

  public reset(): void {
    this.quests.clear();
    INITIAL_QUESTS.forEach(q => this.quests.set(q.id, JSON.parse(JSON.stringify(q))));
    this.discoveredChronicles.clear();
  }

  public addChronicle(chronicleKey: string): boolean {
    if (this.discoveredChronicles.has(chronicleKey)) return false;
    this.discoveredChronicles.add(chronicleKey);
    return true;
  }

  public getQuests(): Quest[] {
    return Array.from(this.quests.values());
  }

  public getQuest(id: string): Quest | undefined {
    return this.quests.get(id);
  }

  public getActiveQuest(): Quest | undefined {
    return Array.from(this.quests.values()).find(q => !q.completed);
  }

  public completeObjective(questId: string, objectiveId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest || quest.completed) return false;

    const obj = quest.objectives.find(o => o.id === objectiveId);
    if (!obj || obj.completed) return false;

    obj.completed = true;

    const allCompleted = quest.objectives.every(o => o.completed);
    if (allCompleted) {
      quest.completed = true;
    }
    return true;
  }

  public completeQuest(questId: string): void {
    const quest = this.quests.get(questId);
    if (quest) {
      quest.completed = true;
      quest.objectives.forEach(o => (o.completed = true));
    }
  }

  public isQuestCompleted(questId: string): boolean {
    return !!this.quests.get(questId)?.completed;
  }

  public isObjectiveCompleted(questId: string, objectiveId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest) return false;
    return !!quest.objectives.find(o => o.id === objectiveId)?.completed;
  }
}
