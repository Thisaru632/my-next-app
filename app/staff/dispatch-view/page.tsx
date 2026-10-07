'use client';

import React, { useState, useMemo, useRef, ChangeEvent, DragEvent } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    TablePagination,
    TableSortLabel,
    Button,
    IconButton,
    TextField,
    InputAdornment,
    Tooltip,
    Alert,
    Chip,
    Stack,
} from '@mui/material';
import {
    LocalShipping as LocalShippingIcon,
    CloudUpload as CloudUploadIcon,
    UploadFile as UploadFileIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    FileDownload as DownloadIcon,
    DeleteOutline as DeleteOutlineIcon,
    TableView as TableViewIcon,
    InsertDriveFile as FileIcon,
    PlayArrow as PlayArrowIcon,
    Tune as TuneIcon,
    InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import { useThemeContext } from '@/context/ThemeContext';

// --- Sample Dispatch CSV Data for instant demonstration ---
const SAMPLE_DISPATCH_CSV = `Tracking ID,Order Number,Customer Name,Contact Phone,Delivery Address,Destination City,Vehicle / Cab,Driver Name,Status,Dispatch Time,Delivery Fee (LKR)
TRK-2026-001,ORD-89421,Kasun Perera,+94 77 123 4567,"42 Galle Road, Bambalapitiya",Colombo 04,CAB-01 (Prius),Nimal Silva,Dispatched,08:30 AM,1500
TRK-2026-002,ORD-89422,Dilshan Jayawardena,+94 71 234 5678,"15/B Kandy Road, Kadawatha",Gampaha,VAN-03 (KDH),Kamal Fernando,In Transit,09:15 AM,2400
TRK-2026-003,ORD-89423,Chamari Senanayake,+94 76 345 6789,"88 High Level Road, Maharagama",Colombo,CAB-04 (WagonR),Sunil Wickramasinghe,Delivered,07:45 AM,1200
TRK-2026-004,ORD-89424,Ruwan Dissanayake,+94 70 456 7890,"204 Negombo Road, Wattala",Gampaha,CAB-02 (Axio),Janaka Bandara,In Transit,09:45 AM,1800
TRK-2026-005,ORD-89425,Anoma Wijesinghe,+94 72 567 8901,"12 Temple Trees Avenue, Nawala",Rajagiriya,CAB-05 (Aqua),Pradeep Kumara,Delivered,08:00 AM,950
TRK-2026-006,ORD-89426,Tharindu Mendis,+94 75 678 9012,"77 Havelock Road, Wellawatte",Colombo 06,CAB-01 (Prius),Nimal Silva,Dispatched,10:00 AM,1300
TRK-2026-007,ORD-89427,Sachini Gunasekara,+94 78 789 0123,"103 Ward Place, Cinnamon Gardens",Colombo 07,CAB-06 (Fit),Dinesh Gunawardena,Pending,10:30 AM,1100
TRK-2026-008,ORD-89428,Mahesh Karunaratne,+94 71 890 1234,"55 Cotta Road, Borella",Colombo 08,CAB-04 (WagonR),Sunil Wickramasinghe,In Transit,09:30 AM,1000
TRK-2026-009,ORD-89429,Nadeeka Rathnayake,+94 77 901 2345,"310 Kotte Road, Nugegoda",Nugegoda,VAN-03 (KDH),Kamal Fernando,Delivered,08:15 AM,1400
TRK-2026-010,ORD-89430,Chathura Weerakkody,+94 76 012 3456,"89 Parliament Road, Battaramulla",Battaramulla,CAB-02 (Axio),Janaka Bandara,Pending,11:00 AM,1600`;

// Auto-detect CSV delimiter (comma, semicolon, tab)
function detectDelimiter(firstLine: string): string {
    let commaCount = 0;
    let semiCount = 0;
    let tabCount = 0;
    let inQuotes = false;

    for (let i = 0; i < firstLine.length; i++) {
        const c = firstLine[i];
        if (c === '"') inQuotes = !inQuotes;
        else if (!inQuotes) {
            if (c === ',') commaCount++;
            else if (c === ';') semiCount++;
            else if (c === '\t') tabCount++;
        }
    }

    if (semiCount > commaCount && semiCount > tabCount) return ';';
    if (tabCount > commaCount && tabCount > semiCount) return '\t';
    return ',';
}

// RFC-4180 compliant CSV parser
function parseCSV(text: string): { headers: string[]; rows: string[][]; error?: string } {
    if (!text || !text.trim()) {
        return { headers: [], rows: [], error: 'The uploaded file is empty.' };
    }

    const cleanText = text.replace(/^\uFEFF/, '');
    const firstLineEnd = cleanText.search(/[\r\n]/);
    const firstLine = firstLineEnd === -1 ? cleanText : cleanText.slice(0, firstLineEnd);
    const delimiter = detectDelimiter(firstLine);

    const lines: string[][] = [];
    let currentLine: string[] = [];
    let currentCell = '';
    let insideQuotes = false;

    for (let i = 0; i < cleanText.length; i++) {
        const char = cleanText[i];
        const nextChar = cleanText[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentCell += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === delimiter && !insideQuotes) {
            currentLine.push(currentCell.trim());
            currentCell = '';
        } else if ((char === '\r' || char === '\n') && !insideQuotes) {
            if (char === '\r' && nextChar === '\n') {
                i++;
            }
            currentLine.push(currentCell.trim());
            currentCell = '';
            if (currentLine.some(cell => cell.length > 0)) {
                lines.push(currentLine);
            }
            currentLine = [];
        } else {
            currentCell += char;
        }
    }

    if (currentCell.length > 0 || currentLine.length > 0) {
        currentLine.push(currentCell.trim());
        if (currentLine.some(cell => cell.length > 0)) {
            lines.push(currentLine);
        }
    }

    if (lines.length === 0) {
        return { headers: [], rows: [], error: 'No data rows found in the CSV.' };
    }

    const rawHeaders = lines[0];
    const headers = rawHeaders.map((h, idx) => (h && h.trim()) ? h.trim() : `Column ${idx + 1}`);
    const rows = lines.slice(1).map(row => {
        const padded = [...row];
        while (padded.length < headers.length) {
            padded.push('');
        }
        return padded;
    });

    return { headers, rows };
}

export default function DispatchViewPage() {
    const { mode } = useThemeContext();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // CSV state
    const [fileName, setFileName] = useState<string>('');
    const [headers, setHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<string[][]>([]);
    const [parseError, setParseError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    // Interactive Table state
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [sortColumnIndex, setSortColumnIndex] = useState<number | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Handle File Process
    const handleProcessFile = (file: File) => {
        setParseError(null);
        if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt') && !file.name.toLowerCase().endsWith('.tsv')) {
            setParseError('Please upload a valid CSV file (.csv, .tsv, or .txt).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const parsed = parseCSV(text);
                if (parsed.error) {
                    setParseError(parsed.error);
                    return;
                }
                setHeaders(parsed.headers);
                setRows(parsed.rows);
                setFileName(file.name);
                setPage(0);
                setSortColumnIndex(null);
            } catch (err: any) {
                setParseError(err?.message || 'Failed to parse the uploaded CSV file.');
            }
        };
        reader.onerror = () => {
            setParseError('An error occurred while reading the file.');
        };
        reader.readAsText(file, 'UTF-8');
    };

    // File input change handler
    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleProcessFile(file);
        }
        // Reset file input value so re-selecting same file fires onChange
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Drag & Drop handlers
    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleProcessFile(file);
        }
    };

    // Load Sample Data
    const handleLoadSampleData = () => {
        setParseError(null);
        const parsed = parseCSV(SAMPLE_DISPATCH_CSV);
        setHeaders(parsed.headers);
        setRows(parsed.rows);
        setFileName('sample_dispatch_manifest.csv');
        setPage(0);
        setSortColumnIndex(null);
    };

    // Clear uploaded CSV
    const handleClearData = () => {
        setHeaders([]);
        setRows([]);
        setFileName('');
        setParseError(null);
        setSearchQuery('');
        setPage(0);
        setSortColumnIndex(null);
    };

    // Sorting handler
    const handleRequestSort = (columnIndex: number) => {
        const isAsc = sortColumnIndex === columnIndex && sortDirection === 'asc';
        setSortDirection(isAsc ? 'desc' : 'asc');
        setSortColumnIndex(columnIndex);
    };

    // Filter and sort rows
    const filteredRows = useMemo(() => {
        let result = rows;

        // Search filtering across all cells
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(row => row.some(cell => cell.toLowerCase().includes(q)));
        }

        // Sorting
        if (sortColumnIndex !== null && sortColumnIndex < headers.length) {
            result = [...result].sort((a, b) => {
                const valA = (a[sortColumnIndex] || '').trim();
                const valB = (b[sortColumnIndex] || '').trim();

                // Numeric check
                const numA = parseFloat(valA.replace(/[^0-9.-]+/g, ''));
                const numB = parseFloat(valB.replace(/[^0-9.-]+/g, ''));

                if (!isNaN(numA) && !isNaN(numB) && valA === numA.toString() && valB === numB.toString()) {
                    return sortDirection === 'asc' ? numA - numB : numB - numA;
                }

                // String comparison
                return sortDirection === 'asc'
                    ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' })
                    : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: 'base' });
            });
        }

        return result;
    }, [rows, headers, searchQuery, sortColumnIndex, sortDirection]);

    // Paginated rows
    const paginatedRows = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredRows.slice(start, start + rowsPerPage);
    }, [filteredRows, page, rowsPerPage]);

    // Export current filtered rows back to CSV
    const handleExportCSV = () => {
        if (headers.length === 0 || rows.length === 0) return;

        const formatCell = (val: string) => {
            if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
                return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        };

        const headerLine = headers.map(formatCell).join(',');
        const rowsLines = filteredRows.map(row => row.map(formatCell).join(','));
        const csvContent = [headerLine, ...rowsLines].join('\r\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName ? `export_${fileName}` : 'dispatch_view_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Helper to render status badges if column contains status-like text
    const renderCellContent = (value: string, headerName: string) => {
        const lowerHeader = headerName.toLowerCase();
        const lowerVal = value.toLowerCase().trim();

        if (lowerHeader.includes('status') || lowerHeader === 'state') {
            if (lowerVal === 'delivered' || lowerVal === 'completed' || lowerVal === 'success') {
                return (
                    <Chip
                        label={value}
                        size="small"
                        sx={{
                            bgcolor: '#dcfce7',
                            color: '#15803d',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            border: '1px solid #bbf7d0',
                        }}
                    />
                );
            }
            if (lowerVal === 'in transit' || lowerVal === 'on the way' || lowerVal === 'shipping') {
                return (
                    <Chip
                        label={value}
                        size="small"
                        sx={{
                            bgcolor: '#eff6ff',
                            color: '#1d4ed8',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            border: '1px solid #bfdbfe',
                        }}
                    />
                );
            }
            if (lowerVal === 'dispatched' || lowerVal === 'assigned') {
                return (
                    <Chip
                        label={value}
                        size="small"
                        sx={{
                            bgcolor: '#f5f3ff',
                            color: '#6d28d9',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            border: '1px solid #ddd6fe',
                        }}
                    />
                );
            }
            if (lowerVal === 'pending' || lowerVal === 'processing' || lowerVal === 'queued') {
                return (
                    <Chip
                        label={value}
                        size="small"
                        sx={{
                            bgcolor: '#fef3c7',
                            color: '#b45309',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            border: '1px solid #fde68a',
                        }}
                    />
                );
            }
            if (lowerVal === 'cancelled' || lowerVal === 'failed' || lowerVal === 'rejected') {
                return (
                    <Chip
                        label={value}
                        size="small"
                        sx={{
                            bgcolor: '#fee2e2',
                            color: '#b91c1c',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            border: '1px solid #fecaca',
                        }}
                    />
                );
            }
        }

        return (
            <Typography variant="body2" sx={{ fontSize: '0.84rem', color: 'text.primary', wordBreak: 'break-word' }}>
                {value || '-'}
            </Typography>
        );
    };

    return (
        <Box sx={{ pb: 6 }}>
            {/* Header Title Section */}
            <Box
                sx={{
                    mb: 3,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { xs: 'flex-start', md: 'center' },
                    justifyContent: 'space-between',
                    gap: 2,
                }}
            >
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                            }}
                        >
                            <LocalShippingIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em' }}>
                                Dispatch View
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                Upload and inspect dispatch CSV manifests with instant multi-column tabular view
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Top Action Buttons */}
                <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                    {headers.length === 0 ? (
                        <Button
                            variant="outlined"
                            startIcon={<PlayArrowIcon />}
                            onClick={handleLoadSampleData}
                            sx={{
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                '&:hover': {
                                    borderColor: 'primary.dark',
                                    bgcolor: mode === 'light' ? 'rgba(37, 99, 235, 0.05)' : 'rgba(37, 99, 235, 0.15)',
                                }
                            }}
                        >
                            Load Sample Dispatch CSV
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<DownloadIcon />}
                                onClick={handleExportCSV}
                                sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                }}
                            >
                                Export CSV ({filteredRows.length})
                            </Button>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteOutlineIcon />}
                                onClick={handleClearData}
                                sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                }}
                            >
                                Clear Table
                            </Button>
                        </>
                    )}

                    <Button
                        variant="contained"
                        startIcon={<UploadFileIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
                            }
                        }}
                    >
                        {headers.length > 0 ? 'Upload New CSV' : 'Upload CSV'}
                    </Button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        accept=".csv, .txt, .tsv, text/csv, text/plain"
                        style={{ display: 'none' }}
                    />
                </Stack>
            </Box>

            {/* Parse Error Alert */}
            {parseError && (
                <Alert
                    severity="error"
                    onClose={() => setParseError(null)}
                    sx={{ mb: 3, borderRadius: '10px' }}
                >
                    {parseError}
                </Alert>
            )}

            {/* Drag & Drop Upload Card (visible when no file) */}
            {headers.length === 0 && (
                <Paper
                    elevation={0}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                        p: { xs: 4, sm: 6 },
                        mb: 4,
                        textAlign: 'center',
                        cursor: 'pointer',
                        borderRadius: '16px',
                        border: '2px dashed',
                        borderColor: isDragging ? 'primary.main' : (mode === 'light' ? '#cbd5e1' : '#334155'),
                        bgcolor: isDragging
                            ? (mode === 'light' ? '#eff6ff' : 'rgba(37, 99, 235, 0.1)')
                            : (mode === 'light' ? '#f8fafc' : 'rgba(255,255,255,0.02)'),
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: mode === 'light' ? '#f1f5f9' : 'rgba(255,255,255,0.04)',
                            transform: 'translateY(-2px)',
                        },
                    }}
                >
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: mode === 'light' ? '#e0e7ff' : 'rgba(99, 102, 241, 0.2)',
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                        }}
                    >
                        <CloudUploadIcon sx={{ fontSize: 34 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                        Drag & drop your CSV file here, or click to browse
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 480, mx: 'auto', mb: 2 }}>
                        Supports standard comma, semicolon, or tab-delimited dispatch files (.csv, .tsv, .txt) with quote escaping.
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        <Chip label=".CSV" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                        <Chip label=".TSV" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                        <Chip label="UTF-8" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                        <Chip label="RFC-4180" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                    </Stack>
                </Paper>
            )}

            {/* Table Container Card */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: '16px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                }}
            >
                {/* Search & Table Toolbar */}
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: 'space-between',
                        gap: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <TextField
                        size="small"
                        placeholder="Search across all CSV columns and rows..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setPage(0);
                        }}
                        disabled={headers.length === 0}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery ? (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                                        <ClearIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </InputAdornment>
                            ) : null,
                        }}
                        sx={{
                            maxWidth: { xs: '100%', sm: 380 },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                            }
                        }}
                    />

                    {headers.length > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                Showing {paginatedRows.length} of {filteredRows.length} rows
                            </Typography>
                            {sortColumnIndex !== null && (
                                <Chip
                                    label={`Sorted by: ${headers[sortColumnIndex]} (${sortDirection.toUpperCase()})`}
                                    size="small"
                                    onDelete={() => setSortColumnIndex(null)}
                                    sx={{ borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}
                                />
                            )}
                        </Box>
                    )}
                </Box>

                {/* The CSV Table */}
                {headers.length === 0 ? (
                    <Box sx={{ p: 8, textAlign: 'center' }}>
                        <TableViewIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5, opacity: 0.6 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                            No CSV File Uploaded Yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 460, mx: 'auto', mb: 3 }}>
                            Upload your dispatch spreadsheet or try our sample data to view all columns, customer addresses, orders, and delivery assignments.
                        </Typography>
                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Button
                                variant="contained"
                                startIcon={<UploadFileIcon />}
                                onClick={() => fileInputRef.current?.click()}
                                sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                }}
                            >
                                Choose CSV File
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<PlayArrowIcon />}
                                onClick={handleLoadSampleData}
                                sx={{
                                    borderRadius: '10px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Load Sample Dispatch Data
                            </Button>
                        </Stack>
                    </Box>
                ) : filteredRows.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <SearchIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                            No Matching Records Found
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                            No rows matched your search query &ldquo;{searchQuery}&rdquo;. Try another term or reset filters.
                        </Typography>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setSearchQuery('')}
                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                        >
                            Clear Search Filter
                        </Button>
                    </Box>
                ) : (
                    <>
                        <TableContainer sx={{ maxHeight: 650, overflowX: 'auto' }}>
                            <Table stickyHeader size="small" sx={{ minWidth: 650 }}>
                                <TableHead>
                                    <TableRow>
                                        {/* Row Index Header */}
                                        <TableCell
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '0.78rem',
                                                bgcolor: mode === 'light' ? '#f8fafc' : '#1e293b',
                                                color: 'text.secondary',
                                                width: 50,
                                                textAlign: 'center',
                                                borderBottom: '2px solid',
                                                borderColor: 'divider',
                                            }}
                                        >
                                            #
                                        </TableCell>

                                        {/* Dynamic Headers from CSV */}
                                        {headers.map((header, colIdx) => (
                                            <TableCell
                                                key={colIdx}
                                                sortDirection={sortColumnIndex === colIdx ? sortDirection : false}
                                                sx={{
                                                    fontWeight: 700,
                                                    fontSize: '0.8rem',
                                                    bgcolor: mode === 'light' ? '#f8fafc' : '#1e293b',
                                                    color: 'text.primary',
                                                    whiteSpace: 'nowrap',
                                                    borderBottom: '2px solid',
                                                    borderColor: 'divider',
                                                }}
                                            >
                                                <TableSortLabel
                                                    active={sortColumnIndex === colIdx}
                                                    direction={sortColumnIndex === colIdx ? sortDirection : 'asc'}
                                                    onClick={() => handleRequestSort(colIdx)}
                                                    sx={{
                                                        '&.Mui-active': {
                                                            color: 'primary.main',
                                                        },
                                                        '& .MuiTableSortLabel-icon': {
                                                            color: 'primary.main !important',
                                                        },
                                                    }}
                                                >
                                                    {header}
                                                </TableSortLabel>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {paginatedRows.map((row, rowIdx) => {
                                        const globalIndex = page * rowsPerPage + rowIdx + 1;
                                        return (
                                            <TableRow
                                                key={rowIdx}
                                                hover
                                                sx={{
                                                    '&:nth-of-type(even)': {
                                                        bgcolor: mode === 'light' ? 'rgba(0,0,0,0.015)' : 'rgba(255,255,255,0.01)',
                                                    },
                                                    '&:hover': {
                                                        bgcolor: mode === 'light' ? 'rgba(37, 99, 235, 0.04) !important' : 'rgba(37, 99, 235, 0.1) !important',
                                                    },
                                                    transition: 'background-color 0.15s ease',
                                                }}
                                            >
                                                {/* Line number */}
                                                <TableCell
                                                    sx={{
                                                        textAlign: 'center',
                                                        color: 'text.secondary',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        borderBottom: '1px solid',
                                                        borderColor: 'divider',
                                                    }}
                                                >
                                                    {globalIndex}
                                                </TableCell>

                                                {/* Dynamic cells */}
                                                {headers.map((header, colIdx) => (
                                                    <TableCell
                                                        key={colIdx}
                                                        sx={{
                                                            py: 1.25,
                                                            borderBottom: '1px solid',
                                                            borderColor: 'divider',
                                                        }}
                                                    >
                                                        {renderCellContent(row[colIdx] || '', header)}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {/* Pagination */}
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 50, 100]}
                            component="div"
                            count={filteredRows.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            sx={{
                                borderTop: '1px solid',
                                borderColor: 'divider',
                                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                    fontSize: '0.85rem',
                                },
                            }}
                        />
                    </>
                )}
            </Paper>
        </Box>
    );
}
