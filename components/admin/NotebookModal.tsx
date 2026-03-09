import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Box,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Checkbox,
    Paper,
    Chip,
    Snackbar,
    Alert,
} from '@mui/material';
import {
    Close as CloseIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    AccessAlarm as AlarmIcon,
    Save as SaveIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface Note {
    id: string;
    text: string;
}

interface Todo {
    id: string;
    text: string;
    completed: boolean;
    dueDateTime?: string;
    notified?: boolean;
    lastRemindedAt?: number;
}

interface NotebookData {
    notes: Note[] | string; // Support migration from old string layout
    todos: Todo[];
}

interface NotebookModalProps {
    open: boolean;
    onClose: () => void;
}

export default function NotebookModal({ open, onClose }: NotebookModalProps) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState('');
    const [todoDate, setTodoDate] = useState('');
    const [todoTime, setTodoTime] = useState('');

    const [reminderAlert, setReminderAlert] = useState<{ show: boolean, task: string }>({ show: false, task: '' });
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Audio ref for reminder sound
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio('/bell_ring.mp3'); // We'll just rely on the fallback if this doesn't exist
    }, []);

    // Load from localeStorage on mount
    useEffect(() => {
        // Load data even if modal is closed so reminders can trigger in the background?
        // Actually, the component is mounted in staff/page.tsx, so it runs this effect.
        const saved = localStorage.getItem('staff_notebook_data');
        if (saved) {
            try {
                const parsed: NotebookData = JSON.parse(saved);

                // Migration for notes
                let parsedNotes: Note[] = [];
                if (typeof parsed.notes === 'string') {
                    parsedNotes = [{ id: 'note-1', text: parsed.notes }];
                } else if (Array.isArray(parsed.notes)) {
                    parsedNotes = parsed.notes.map((n: any) => ({
                        id: n.id || 'note-' + Date.now(),
                        text: n.text || n.title || n.content || ''
                    })).filter(n => n.text.trim() !== '');
                }

                setNotes(parsedNotes);
                setTodos(parsed.todos || []);
            } catch (e) {
                console.error("Failed to parse notebook data", e);
            }
        }
    }, []);

    // Save to localeStorage whenever notes or todos change
    useEffect(() => {
        // Don't save if it hasn't loaded yet
        if (notes.length === 0) return;

        const data = { notes, todos };
        localStorage.setItem('staff_notebook_data', JSON.stringify(data));
    }, [notes, todos]);

    // Reminder checker
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            let changed = false;

            setTodos(prev => {
                const newTodos = prev.map(t => {
                    if (!t.completed && t.dueDateTime) {
                        const due = new Date(t.dueDateTime);

                        if (now >= due) {
                            const lastReminded = t.lastRemindedAt || 0;
                            // 120000ms = 2 minutes
                            if (now.getTime() - lastReminded >= 120000) {
                                changed = true;
                                // Trigger alert popup
                                setReminderAlert({ show: true, task: t.text });
                                // Try to play sound
                                if (audioRef.current) {
                                    audioRef.current.play().catch(e => console.log("Audio play blocked by browser", e));
                                }
                                return { ...t, notified: true, lastRemindedAt: now.getTime() };
                            }
                        }
                    }
                    return t;
                });
                return changed ? newTodos : prev;
            });
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // Note Handlers
    const handleAddNote = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newNote.trim()) return;

        const newEntry: Note = {
            id: 'note-' + Date.now().toString(),
            text: newNote.trim(),
        };

        setNotes([...notes, newEntry]);
        setNewNote('');
        setSaveSuccess(true);
    };

    const handleDeleteNote = (id: string) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    // Todo Handlers
    const handleAddTodo = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newTodo.trim()) return;

        let dueDateTime = undefined;
        if (todoDate && todoTime) {
            dueDateTime = new Date(`${todoDate}T${todoTime}`).toISOString();
        }

        const newEntry: Todo = {
            id: Date.now().toString(),
            text: newTodo.trim(),
            completed: false,
            dueDateTime,
            notified: false,
        };

        setTodos([...todos, newEntry]);
        setNewTodo('');
        setTodoDate('');
        setTodoTime('');
    };

    const handleToggleTodo = (id: string) => {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const handleDeleteTodo = (id: string) => {
        setTodos(todos.filter(t => t.id !== id));
    };


    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="lg"
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        height: '85vh',
                        display: 'flex',
                        flexDirection: 'column'
                    }
                }}
            >
                <DialogTitle sx={{
                    m: 0,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Typography component="div" variant="h6" fontWeight="700" color="text.primary">
                        📓 Personal Notebook & To-Do List
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={onClose}
                        sx={{
                            color: 'text.secondary',
                            '&:hover': { color: 'error.main', background: 'error.lighter' }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, overflow: 'hidden' }}>
                    {/* Left Side: Notes */}
                    <Box sx={{
                        flex: 1,
                        p: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRight: { xs: 'none', md: '1px solid' },
                        borderBottom: { xs: '1px solid', md: 'none' },
                        borderColor: 'divider',
                        bgcolor: '#fffef9' // slightly yellowish like a notebook
                    }}>
                        <Typography variant="subtitle1" fontWeight="700" color="text.secondary" mb={2}>
                            Quick Notes
                        </Typography>

                        <Box component="form" onSubmit={handleAddNote} sx={{ mb: 2 }}>
                            <Box display="flex" gap={1}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Add a new note..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'background.paper' }
                                    }}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="success"
                                    disabled={!newNote.trim()}
                                    sx={{ minWidth: '40px', p: '8px', borderRadius: '8px', textTransform: 'none' }}
                                >
                                    <SaveIcon sx={{ mr: 0.5 }} fontSize="small" /> Save
                                </Button>
                            </Box>
                        </Box>

                        <Paper variant="outlined" sx={{ flex: 1, overflowY: 'auto', borderRadius: '8px', bgcolor: 'transparent', border: 'none' }}>
                            {notes.length === 0 ? (
                                <Box height="100%" display="flex" alignItems="center" justifyContent="center">
                                    <Typography color="text.secondary" variant="body2" sx={{ fontStyle: 'italic' }}>
                                        No notes added yet.
                                    </Typography>
                                </Box>
                            ) : (
                                <List sx={{ pt: 0 }}>
                                    {notes.map((note) => (
                                        <ListItem
                                            key={note.id}
                                            sx={{
                                                mb: 1,
                                                borderRadius: '8px',
                                                bgcolor: 'background.paper',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                transition: 'all 0.2s ease',
                                                color: 'text.primary',
                                            }}
                                            secondaryAction={
                                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteNote(note.id)} size="small" sx={{ color: 'error.light', '&:hover': { color: 'error.main' } }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            }
                                        >
                                            <ListItemText primary={note.text} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Box>

                    {/* Right Side: To-Do */}
                    <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
                        <Typography variant="subtitle1" fontWeight="700" color="text.secondary" mb={2}>
                            To-Do List & Reminders
                        </Typography>

                        <Box component="form" onSubmit={handleAddTodo} sx={{ mb: 2 }}>
                            <Box display="flex" gap={1} mb={1}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Add a new task..."
                                    value={newTodo}
                                    onChange={(e) => setNewTodo(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': { borderRadius: '8px' }
                                    }}
                                />
                            </Box>
                            <Box display="flex" gap={1}>
                                <TextField
                                    type="date"
                                    size="small"
                                    value={todoDate}
                                    onChange={(e) => setTodoDate(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' }, flex: 1 }}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    type="time"
                                    size="small"
                                    value={todoTime}
                                    onChange={(e) => setTodoTime(e.target.value)}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' }, flex: 1 }}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={!newTodo.trim()}
                                    sx={{ minWidth: '40px', p: '8px', borderRadius: '8px' }}
                                >
                                    <AddIcon />
                                </Button>
                            </Box>
                        </Box>

                        <Paper variant="outlined" sx={{ flex: 1, overflowY: 'auto', borderRadius: '8px', bgcolor: 'transparent', border: 'none' }}>
                            {todos.length === 0 ? (
                                <Box height="100%" display="flex" alignItems="center" justifyContent="center">
                                    <Typography color="text.secondary" variant="body2" sx={{ fontStyle: 'italic' }}>
                                        No tasks added yet.
                                    </Typography>
                                </Box>
                            ) : (
                                <List sx={{ pt: 0 }}>
                                    {todos.map((todo) => {
                                        const now = new Date();
                                        // Is it overdue? (Not finished, notified flag is true or due date has passed)
                                        const isOverdue = !todo.completed && todo.dueDateTime && (todo.notified || new Date(todo.dueDateTime) <= now);

                                        return (
                                            <ListItem
                                                key={todo.id}
                                                sx={{
                                                    mb: 1,
                                                    borderRadius: '8px',
                                                    bgcolor: todo.completed ? 'action.hover' : 'background.paper',
                                                    border: '1px solid',
                                                    borderColor: isOverdue ? 'error.light' : 'divider',
                                                    transition: 'all 0.2s ease',
                                                    color: todo.completed ? 'text.disabled' : 'text.primary',
                                                }}
                                                secondaryAction={
                                                    <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTodo(todo.id)} size="small" sx={{ color: 'error.light', '&:hover': { color: 'error.main' } }}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                }
                                            >
                                                <ListItemIcon sx={{ minWidth: '36px' }}>
                                                    <Checkbox
                                                        edge="start"
                                                        checked={todo.completed}
                                                        onChange={() => handleToggleTodo(todo.id)}
                                                        disableRipple
                                                        size="small"
                                                    />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={
                                                        <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                                                            {todo.text}
                                                        </span>
                                                    }
                                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                                                    secondary={
                                                        todo.dueDateTime && (
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.75rem', color: isOverdue ? '#ef4444' : '#64748b' }}>
                                                                <AlarmIcon fontSize="inherit" />
                                                                {new Date(todo.dueDateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                                {isOverdue && !todo.completed && " (OVERDUE)"}
                                                            </span>
                                                        )
                                                    }
                                                />
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            )}
                        </Paper>
                    </Box>
                </DialogContent>
            </Dialog>

            {/* Global Reminder Snackbar component - rendering independently of the dialog so it shows even if dialog closed */}
            <Snackbar
                open={reminderAlert.show}
                autoHideDuration={10000}
                onClose={() => setReminderAlert({ ...reminderAlert, show: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{ zIndex: 9999 }} // Ensures it is above everything
            >
                <Alert
                    onClose={() => setReminderAlert({ ...reminderAlert, show: false })}
                    severity="warning"
                    variant="filled"
                    sx={{ width: '100%', fontWeight: 600, fontSize: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                    icon={<AlarmIcon fontSize="inherit" />}
                >
                    REMINDER: {reminderAlert.task}
                </Alert>
            </Snackbar>

            {/* Save Success Snackbar */}
            <Snackbar
                open={saveSuccess}
                autoHideDuration={3000}
                onClose={() => setSaveSuccess(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                sx={{ zIndex: 9999 }}
            >
                <Alert
                    onClose={() => setSaveSuccess(false)}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%', fontWeight: 600 }}
                    icon={<CheckCircleIcon fontSize="inherit" />}
                >
                    Note saved successfully!
                </Alert>
            </Snackbar>
        </>
    );
}
