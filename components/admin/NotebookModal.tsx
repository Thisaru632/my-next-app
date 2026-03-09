import React, { useState, useEffect } from 'react';
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
    Divider,
    Paper,
} from '@mui/material';
import {
    Close as CloseIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
} from '@mui/icons-material';

interface Todo {
    id: string;
    text: string;
    completed: boolean;
}

interface NotebookData {
    notes: string;
    todos: Todo[];
}

interface NotebookModalProps {
    open: boolean;
    onClose: () => void;
}

export default function NotebookModal({ open, onClose }: NotebookModalProps) {
    const [notes, setNotes] = useState('');
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodo, setNewTodo] = useState('');

    // Load from localeStorage on mount
    useEffect(() => {
        if (open) {
            const saved = localStorage.getItem('staff_notebook_data');
            if (saved) {
                try {
                    const parsed: NotebookData = JSON.parse(saved);
                    setNotes(parsed.notes || '');
                    setTodos(parsed.todos || []);
                } catch (e) {
                    console.error("Failed to parse notebook data", e);
                }
            }
        }
    }, [open]);

    // Save to localeStorage whenever notes or todos change
    useEffect(() => {
        const data: NotebookData = { notes, todos };
        localStorage.setItem('staff_notebook_data', JSON.stringify(data));
    }, [notes, todos]);

    const handleAddTodo = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newTodo.trim()) return;

        const newEntry: Todo = {
            id: Date.now().toString(),
            text: newTodo.trim(),
            completed: false,
        };

        setTodos([...todos, newEntry]);
        setNewTodo('');
    };

    const handleToggleTodo = (id: string) => {
        setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const handleDeleteTodo = (id: string) => {
        setTodos(todos.filter(t => t.id !== id));
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    height: '80vh',
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
                <Typography variant="h6" fontWeight="700" color="text.primary">
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
                    <TextField
                        multiline
                        fullWidth
                        placeholder="Type your notes here... They are automatically saved."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        variant="standard"
                        InputProps={{
                            disableUnderline: true,
                            sx: {
                                fontSize: '1rem',
                                lineHeight: 1.6,
                                fontFamily: "'Inter', sans-serif"
                            }
                        }}
                        sx={{
                            flex: 1,
                            overflowY: 'auto',
                            '& .MuiInputBase-root': {
                                height: '100%',
                                alignItems: 'flex-start'
                            }
                        }}
                    />
                </Box>

                {/* Right Side: To-Do */}
                <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle1" fontWeight="700" color="text.secondary" mb={2}>
                        To-Do List
                    </Typography>

                    <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder="Add a new task..."
                            value={newTodo}
                            onChange={(e) => setNewTodo(e.target.value)}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                }
                            }}
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
                    </form>

                    <Paper variant="outlined" sx={{ flex: 1, overflowY: 'auto', borderRadius: '8px', bgcolor: 'transparent', border: 'none' }}>
                        {todos.length === 0 ? (
                            <Box height="100%" display="flex" alignItems="center" justifyContent="center">
                                <Typography color="text.secondary" variant="body2" sx={{ fontStyle: 'italic' }}>
                                    No tasks added yet.
                                </Typography>
                            </Box>
                        ) : (
                            <List sx={{ pt: 0 }}>
                                {todos.map((todo) => (
                                    <ListItem
                                        key={todo.id}
                                        sx={{
                                            mb: 1,
                                            borderRadius: '8px',
                                            bgcolor: todo.completed ? 'action.hover' : 'background.paper',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            transition: 'all 0.2s ease',
                                            textDecoration: todo.completed ? 'line-through' : 'none',
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
                                        <ListItemText primary={todo.text} primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }} />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Paper>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
