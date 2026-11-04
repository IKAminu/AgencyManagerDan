import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { BookOpen, CalendarDays, CheckCircle2, Circle, ClipboardList, FileText, LoaderCircle, Pencil, Plus, Search, StickyNote, Trash2, X } from 'lucide-react'
import { Link } from 'react-router'
import { Badge, Button, EmptyState, Field, Input, Modal, PageHeader, Select } from '@/components/ui'
import { useAppStore } from '@/hooks/useAppStore'
import { supabase } from '@/lib/supabase'

type NoteKind = 'Note' | 'Reminder' | 'To-do'
type NotePriority = 'Low' | 'Normal' | 'High'
type AgencyNote = {
  id: string
  title: string
  body: string
  kind: NoteKind
  due_date: string | null
  priority: NotePriority
  completed: boolean
  created_at: string
  updated_at: string
}

const demoNotes: AgencyNote[] = []
const today = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
const dateLabel = (value: string | null) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No due date'

export function NotesPage() {
  const { mode } = useAppStore()
  const [tab, setTab] = useState<'all' | 'Note' | 'Reminder' | 'To-do'>('all')
  const [filter, setFilter] = useState<'all' | 'open' | 'completed'>('all')
  const [query, setQuery] = useState('')
  const [notes, setNotes] = useState<AgencyNote[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<AgencyNote | null>(null)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [kind, setKind] = useState<NoteKind>('Note')
  const [priority, setPriority] = useState<NotePriority>('Normal')
  const [dueDate, setDueDate] = useState('')
  const [completed, setCompleted] = useState(false)

  const loadNotes = useCallback(async () => {
    if (mode === 'demo') {
      setNotes(demoNotes)
      setLoading(false)
      return
    }
    if (!supabase) {
      setError('The database connection is not configured.')
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: loadError } = await supabase.from('agency_notes').select('*').order('created_at', { ascending: false })
    if (loadError) setError(loadError.message)
    else { setNotes((data || []) as AgencyNote[]); setError('') }
    setLoading(false)
  }, [mode])

  useEffect(() => { void loadNotes() }, [loadNotes])

  const visible = useMemo(() => notes.filter((note) => {
    const matchesTab = tab === 'all' || note.kind === tab
    const matchesFilter = filter === 'all' || (filter === 'open' ? !note.completed : note.completed)
    const matchesQuery = !query.trim() || `${note.title} ${note.body}`.toLowerCase().includes(query.trim().toLowerCase())
    return matchesTab && matchesFilter && matchesQuery
  }), [notes, tab, filter, query])

  const openNew = (nextKind: NoteKind = 'Note') => {
    setEditing(null); setTitle(''); setBody(''); setKind(nextKind); setPriority('Normal'); setDueDate(''); setCompleted(false); setEditorOpen(true)
  }
  const openEdit = (note: AgencyNote) => {
    setEditing(note); setTitle(note.title); setBody(note.body); setKind(note.kind); setPriority(note.priority); setDueDate(note.due_date || ''); setCompleted(note.completed); setEditorOpen(true)
  }
  const saveNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim()) return
    setSaving(true); setError('')
    const values = { title: title.trim(), body: body.trim(), kind, priority, due_date: dueDate || null, completed, updated_at: new Date().toISOString() }
    if (mode === 'demo') {
      const next: AgencyNote = { id: editing?.id || crypto.randomUUID(), ...values, created_at: editing?.created_at || new Date().toISOString() }
      setNotes((current) => editing ? current.map((item) => item.id === editing.id ? next : item) : [next, ...current])
    } else if (supabase) {
      const result = editing
        ? await supabase.from('agency_notes').update(values).eq('id', editing.id)
        : await supabase.from('agency_notes').insert(values)
      if (result.error) { setError(result.error.message); setSaving(false); return }
      await loadNotes()
    }
    setSaving(false); setEditorOpen(false)
  }
  const toggleCompleted = async (note: AgencyNote) => {
    const next = !note.completed
    if (mode === 'demo') { setNotes((current) => current.map((item) => item.id === note.id ? { ...item, completed: next, updated_at: new Date().toISOString() } : item)); return }
    if (!supabase) return
    setNotes((current) => current.map((item) => item.id === note.id ? { ...item, completed: next } : item))
    const { error: updateError } = await supabase.from('agency_notes').update({ completed: next, updated_at: new Date().toISOString() }).eq('id', note.id)
    if (updateError) { setError(updateError.message); await loadNotes() }
  }
  const deleteNote = async (note: AgencyNote) => {
    if (!window.confirm(`Delete “${note.title}”? This cannot be undone.`)) return
    if (mode === 'demo') { setNotes((current) => current.filter((item) => item.id !== note.id)); return }
    if (!supabase) return
    const { error: deleteError } = await supabase.from('agency_notes').delete().eq('id', note.id)
    if (deleteError) setError(deleteError.message)
    else setNotes((current) => current.filter((item) => item.id !== note.id))
  }

  const openCount = notes.filter((note) => !note.completed).length
  const overdueCount = notes.filter((note) => !note.completed && note.due_date && note.due_date < today()).length

  return <div className="page notes-page">
    <PageHeader title="Notes" description="A shared workspace for agency reminders, working notes and things that need doing." action={<Button onClick={() => openNew()}><Plus size={16} /> New note</Button>} />
    <div className="notes-subnav">
      <Link className="notes-subnav-active" to="/notes"><StickyNote size={16} /> Agency notes</Link>
      <Link to="/notes/guidelines"><BookOpen size={16} /> Guidelines</Link>
    </div>
    <div className="notes-overview">
      <div><span>Open items</span><strong>{openCount}</strong></div>
      <div><span>Overdue</span><strong className={overdueCount ? 'notes-overdue' : ''}>{overdueCount}</strong></div>
      <div><span>Completed</span><strong>{notes.filter((note) => note.completed).length}</strong></div>
    </div>
    {mode === 'demo' && <div className="notes-demo-banner">Demo Mode: notes are temporary and will not be saved to the agency database.</div>}
    <div className="notes-toolbar">
      <div className="notes-search"><Search size={16} /><Input aria-label="Search notes" placeholder="Search notes and reminders…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <div className="notes-filters">
        <Select aria-label="Note type" value={tab} onChange={(event) => setTab(event.target.value as typeof tab)}><option value="all">All types</option><option value="Note">Notes</option><option value="Reminder">Reminders</option><option value="To-do">To-do</option></Select>
        <Select aria-label="Completion filter" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">All items</option><option value="open">Open</option><option value="completed">Completed</option></Select>
      </div>
    </div>
    <div className="notes-create-row">
      <button onClick={() => openNew('Note')}><FileText size={16} /><span>Write a note</span></button>
      <button onClick={() => openNew('Reminder')}><CalendarDays size={16} /><span>Add reminder</span></button>
      <button onClick={() => openNew('To-do')}><ClipboardList size={16} /><span>Create to-do</span></button>
    </div>
    {error && <div className="notes-error" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss error"><X size={14} /></button></div>}
    {loading ? <div className="notes-loading"><LoaderCircle className="toast-spinner" size={20} /> Loading agency notes…</div> : visible.length ? <div className="notes-list">{visible.map((note) => <article className={`note-card ${note.completed ? 'note-completed' : ''}`} key={note.id}>
      <button className="note-check" aria-label={note.completed ? 'Mark as open' : 'Mark as completed'} onClick={() => void toggleCompleted(note)}>{note.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}</button>
      <div className="note-main"><div className="note-title-row"><h2>{note.title}</h2><Badge>{note.kind}</Badge></div>{note.body && <p>{note.body}</p>}<div className="note-meta"><span className={note.priority === 'High' ? 'note-priority-high' : ''}>{note.priority} priority</span><span>{note.due_date ? `Due ${dateLabel(note.due_date)}` : 'No due date'}</span><span>{new Date(note.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span></div></div>
      <div className="note-actions"><button aria-label="Edit note" onClick={() => openEdit(note)}><Pencil size={15} /></button><button aria-label="Delete note" onClick={() => void deleteNote(note)}><Trash2 size={15} /></button></div>
    </article>)}</div> : <EmptyState title={query || tab !== 'all' || filter !== 'all' ? 'No matching notes' : 'Nothing written yet'} text={query || tab !== 'all' || filter !== 'all' ? 'Try changing your search or filters.' : 'Add a note, reminder or to-do to keep agency work organised.'} />}
    {editorOpen && <Modal title={editing ? 'Edit item' : kind === 'To-do' ? 'Create to-do' : kind === 'Reminder' ? 'Add reminder' : 'Write a note'} description="Notes are shared with authorised Headquarters accounts in Live Mode." onClose={() => setEditorOpen(false)}>
      <form className="form-grid notes-editor" onSubmit={saveNote}>
        <Field label="Title"><Input autoFocus required maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What needs to be remembered?" /></Field>
        <Field label="Details"><textarea className="field notes-body-input" rows={5} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Add context, steps, names or useful details…" /></Field>
        <div className="notes-editor-grid">
          <Field label="Type"><Select value={kind} onChange={(event) => setKind(event.target.value as NoteKind)}><option>Note</option><option>Reminder</option><option>To-do</option></Select></Field>
          <Field label="Priority"><Select value={priority} onChange={(event) => setPriority(event.target.value as NotePriority)}><option>Low</option><option>Normal</option><option>High</option></Select></Field>
          <Field label="Due date (optional)"><Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></Field>
        </div>
        {editing && <label className="notes-complete-toggle"><input type="checkbox" checked={completed} onChange={(event) => setCompleted(event.target.checked)} /> Mark as completed</label>}
        {error && <div className="notes-error">{error}</div>}
        <div className="form-actions"><Button type="button" variant="secondary" onClick={() => setEditorOpen(false)}>Cancel</Button><Button type="submit" disabled={saving || !title.trim()}>{saving ? <><LoaderCircle size={15} className="toast-spinner" /> Saving…</> : editing ? 'Save changes' : 'Save item'}</Button></div>
      </form>
    </Modal>}
  </div>
}
