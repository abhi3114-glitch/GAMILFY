import { useEffect, useState } from 'react';
import { storage, Quest, SkillType, QuestSize } from '@/lib/storage';
import { QuestCard } from '@/components/GameUI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { completeQuest, undoQuestCompletion, QUEST_XP } from '@/lib/gameEngine';
import { Plus, Filter, Dumbbell, Brain, Target, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

const SKILL_ICONS = {
  strength: Dumbbell,
  intelligence: Brain,
  discipline: Target,
  social: Users,
  finance: DollarSign,
};

export default function Quests() {
  const [quests, setQuests] = useState(storage.getQuests());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [filterSkill, setFilterSkill] = useState<SkillType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skill, setSkill] = useState<SkillType>('discipline');
  const [size, setSize] = useState<QuestSize>('M');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setQuests(storage.getQuests());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSkill('discipline');
    setSize('M');
    setDueDate('');
    setIsRecurring(false);
    setEditingQuest(null);
  };

  const handleCreateQuest = () => {
    if (!title.trim()) {
      toast.error('Please enter a quest title');
      return;
    }

    const xpReward = QUEST_XP[size];

    if (editingQuest) {
      storage.updateQuest(editingQuest.id, {
        title,
        description,
        skill,
        xpReward,
        size,
        dueDate: dueDate || undefined,
        isRecurring,
      });
      toast.success('Quest updated!');
    } else {
      storage.createQuest({
        title,
        description,
        skill,
        xpReward,
        size,
        dueDate: dueDate || undefined,
        isRecurring,
        completed: false,
      });
      toast.success('Quest created!');
    }

    setQuests(storage.getQuests());
    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (quest: Quest) => {
    setEditingQuest(quest);
    setTitle(quest.title);
    setDescription(quest.description);
    setSkill(quest.skill);
    setSize(quest.size);
    setDueDate(quest.dueDate || '');
    setIsRecurring(quest.isRecurring);
    setDialogOpen(true);
  };

  const handleDelete = (quest: Quest) => {
    if (confirm('Are you sure you want to delete this quest?')) {
      storage.deleteQuest(quest.id);
      setQuests(storage.getQuests());
      toast.success('Quest deleted');
    }
  };

  const handleComplete = (quest: Quest) => {
    completeQuest(quest);
    setQuests(storage.getQuests());
  };

  const handleUndo = (quest: Quest) => {
    undoQuestCompletion(quest);
    setQuests(storage.getQuests());
  };

  // Filter quests
  const filteredQuests = quests.filter(quest => {
    if (filterSkill !== 'all' && quest.skill !== filterSkill) return false;
    if (filterStatus === 'active' && quest.completed) return false;
    if (filterStatus === 'completed' && !quest.completed) return false;
    return true;
  });

  const activeQuests = filteredQuests.filter(q => !q.completed);
  const completedQuests = filteredQuests.filter(q => q.completed);

  const SkillOption = ({ skill: skillName }: { skill: SkillType }) => {
    const Icon = SKILL_ICONS[skillName];
    return (
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="capitalize">{skillName}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Quests</h1>
          <p className="text-muted-foreground">Manage your daily challenges</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={open => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Quest
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingQuest ? 'Edit Quest' : 'Create New Quest'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input placeholder="e.g., Morning workout" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Quest details..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Skill *</Label>
                  <Select value={skill} onValueChange={(v: SkillType) => setSkill(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">
                        <SkillOption skill="strength" />
                      </SelectItem>
                      <SelectItem value="intelligence">
                        <SkillOption skill="intelligence" />
                      </SelectItem>
                      <SelectItem value="discipline">
                        <SkillOption skill="discipline" />
                      </SelectItem>
                      <SelectItem value="social">
                        <SkillOption skill="social" />
                      </SelectItem>
                      <SelectItem value="finance">
                        <SkillOption skill="finance" />
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Size *</Label>
                  <Select value={size} onValueChange={(v: QuestSize) => setSize(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="S">S (10 XP)</SelectItem>
                      <SelectItem value="M">M (25 XP)</SelectItem>
                      <SelectItem value="L">L (50 XP)</SelectItem>
                      <SelectItem value="XL">XL (100 XP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Due Date (Optional)</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <Button onClick={handleCreateQuest} className="w-full">
                {editingQuest ? 'Update Quest' : 'Create Quest'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select value={filterSkill} onValueChange={(v: SkillType | 'all') => setFilterSkill(v)}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            <SelectItem value="strength">
              <SkillOption skill="strength" />
            </SelectItem>
            <SelectItem value="intelligence">
              <SkillOption skill="intelligence" />
            </SelectItem>
            <SelectItem value="discipline">
              <SkillOption skill="discipline" />
            </SelectItem>
            <SelectItem value="social">
              <SkillOption skill="social" />
            </SelectItem>
            <SelectItem value="finance">
              <SkillOption skill="finance" />
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quest Lists */}
      <Tabs value={filterStatus} onValueChange={(v: 'all' | 'active' | 'completed') => setFilterStatus(v)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All ({filteredQuests.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeQuests.length})</TabsTrigger>
          <TabsTrigger value="completed">Done ({completedQuests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {filteredQuests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No quests yet. Create your first quest to get started!</p>
            </div>
          ) : (
            filteredQuests.map(quest => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onComplete={() => handleComplete(quest)}
                onUndo={() => handleUndo(quest)}
                onEdit={() => handleEdit(quest)}
                onDelete={() => handleDelete(quest)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-3 mt-4">
          {activeQuests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No active quests. Create a new quest or check completed ones!</p>
            </div>
          ) : (
            activeQuests.map(quest => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onComplete={() => handleComplete(quest)}
                onEdit={() => handleEdit(quest)}
                onDelete={() => handleDelete(quest)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-4">
          {completedQuests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No completed quests yet. Complete some quests to see them here!</p>
            </div>
          ) : (
            completedQuests.map(quest => <QuestCard key={quest.id} quest={quest} onUndo={() => handleUndo(quest)} onDelete={() => handleDelete(quest)} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}