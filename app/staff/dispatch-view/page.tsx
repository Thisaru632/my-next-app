'use client';

import React, { useState, useEffect, useMemo, useRef, ChangeEvent, DragEvent } from 'react';
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
    CircularProgress,
    Snackbar,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
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
    PlayArrow as PlayArrowIcon,
    DateRange as DateRangeIcon,
    FilterAlt as FilterAltIcon,
} from '@mui/icons-material';
import { useThemeContext } from '@/context/ThemeContext';
import { API_ENDPOINTS } from '@/config/api';

// --- Sample Dispatch CSV Data with realistic dates for instant demonstration ---
const SAMPLE_DISPATCH_CSV = `Tracking ID,Order Number,Customer Name,Contact Phone,Delivery Address,Destination City,Vehicle / Cab,Driver Name,Status,Dispatch Date,Dispatch Time,Delivery Fee (LKR)
TRK-2026-001,ORD-89421,Kasun Perera,+94 77 123 4567,"42 Galle Road, Bambalapitiya",Colombo 04,CAB-01 (Prius),Nimal Silva,Dispatched,2026-10-07,08:30 AM,1500
TRK-2026-002,ORD-89422,Dilshan Jayawardena,+94 71 234 5678,"15/B Kandy Road, Kadawatha",Gampaha,VAN-03 (KDH),Kamal Fernando,In Transit,2026-10-07,09:15 AM,2400
TRK-2026-003,ORD-89423,Chamari Senanayake,+94 76 345 6789,"88 High Level Road, Maharagama",Colombo,CAB-04 (WagonR),Sunil Wickramasinghe,Delivered,2026-10-06,07:45 AM,1200
TRK-2026-004,ORD-89424,Ruwan Dissanayake,+94 70 456 7890,"204 Negombo Road, Wattala",Gampaha,CAB-02 (Axio),Janaka Bandara,In Transit,2026-10-06,09:45 AM,1800
TRK-2026-005,ORD-89425,Anoma Wijesinghe,+94 72 567 8901,"12 Temple Trees Avenue, Nawala",Rajagiriya,CAB-05 (Aqua),Pradeep Kumara,Delivered,2026-10-05,08:00 AM,950
TRK-2026-006,ORD-89426,Tharindu Mendis,+94 75 678 9012,"77 Havelock Road, Wellawatte",Colombo 06,CAB-01 (Prius),Nimal Silva,Dispatched,2026-10-05,10:00 AM,1300
TRK-2026-007,ORD-89427,Sachini Gunasekara,+94 78 789 0123,"103 Ward Place, Cinnamon Gardens",Colombo 07,CAB-06 (Fit),Dinesh Gunawardena,Pending,2026-10-04,10:30 AM,1100
TRK-2026-008,ORD-89428,Mahesh Karunaratne,+94 71 890 1234,"55 Cotta Road, Borella",Colombo 08,CAB-04 (WagonR),Sunil Wickramasinghe,In Transit,2026-10-04,09:30 AM,1000
TRK-2026-009,ORD-89429,Nadeeka Rathnayake,+94 77 901 2345,"310 Kotte Road, Nugegoda",Nugegoda,VAN-03 (KDH),Kamal Fernando,Delivered,2026-10-03,08:15 AM,1400
TRK-2026-010,ORD-89430,Chathura Weerakkody,+94 76 012 3456,"89 Parliament Road, Battaramulla",Battaramulla,CAB-02 (Axio),Janaka Bandara,Pending,2026-10-02,11:00 AM,1600`;

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

// Robust date string normalizer: converts any valid date representation into YYYY-MM-DD
function parseToDateStr(val: string): string | null {
    if (!val || typeof val !== 'string') return null;
    const trimmed = val.trim();
    if (!trimmed || trimmed === '-' || trimmed === 'N/A') return null;

    // Pattern 1: YYYY-MM-DD or YYYY/MM/DD
    const iso = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (iso) {
        const y = iso[1];
        const m = iso[2].padStart(2, '0');
        const d = iso[3].padStart(2, '0');
        const mNum = parseInt(m, 10);
        const dNum = parseInt(d, 10);
        if (mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31) {
            return `${y}-${m}-${d}`;
        }
    }

    // Pattern 2: DD/MM/YYYY or DD-MM-YYYY or MM/DD/YYYY
    const dmy = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (dmy) {
        const p1 = parseInt(dmy[1], 10);
        const p2 = parseInt(dmy[2], 10);
        const y = dmy[3];
        // If p1 > 12, p1 is day, p2 is month
        if (p1 > 12 && p2 <= 12) {
            return `${y}-${p2.toString().padStart(2, '0')}-${p1.toString().padStart(2, '0')}`;
        }
        // If p2 > 12, p1 is month, p2 is day
        if (p2 > 12 && p1 <= 12) {
            return `${y}-${p1.toString().padStart(2, '0')}-${p2.toString().padStart(2, '0')}`;
        }
        // Default DD/MM/YYYY (international/Sri Lanka standard)
        if (p2 <= 12 && p1 <= 31) {
            return `${y}-${p2.toString().padStart(2, '0')}-${p1.toString().padStart(2, '0')}`;
        }
    }

    // Pattern 3: e.g. "07 Oct 2026", "7 October 2026", "Oct 07, 2026"
    const monthNames: Record<string, string> = {
        jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
        jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12'
    };
    const named1 = trimmed.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/);
    if (named1) {
        const mKey = named1[2].slice(0, 3).toLowerCase();
        if (monthNames[mKey]) {
            return `${named1[3]}-${monthNames[mKey]}-${named1[1].padStart(2, '0')}`;
        }
    }
    const named2 = trimmed.match(/^([A-Za-z]{3,9})\s+(\d{1,2}),?\s+(\d{4})/);
    if (named2) {
        const mKey = named2[1].slice(0, 3).toLowerCase();
        if (monthNames[mKey]) {
            return `${named2[3]}-${monthNames[mKey]}-${named2[2].padStart(2, '0')}`;
        }
    }

    return null;
}

export default function DispatchViewPage() {
    const { mode } = useThemeContext();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // CSV and Database state
    const [fileName, setFileName] = useState<string>('');
    const [headers, setHeaders] = useState<string[]>([]);
    const [rows, setRows] = useState<string[][]>([]);
    const [parseError, setParseError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [loadingFromDb, setLoadingFromDb] = useState<boolean>(true);
    const [savingToDb, setSavingToDb] = useState<boolean>(false);
    const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

    // Filter and Pagination state
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedDateColIdx, setSelectedDateColIdx] = useState<number | 'auto'>('auto');
    const [page, setPage] = useState<number>(0);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [sortColumnIndex, setSortColumnIndex] = useState<number | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    // Fetch persisted data from database on mount
    useEffect(() => {
        fetchDispatchFromDb();
    }, []);

    const fetchDispatchFromDb = async () => {
        setLoadingFromDb(true);
        try {
            const res = await fetch(API_ENDPOINTS.DISPATCH_VIEW);
            if (res.ok) {
                const data = await res.json();
                if (data.success && data.hasData && Array.isArray(data.rows) && data.rows.length > 0) {
                    setHeaders(data.headers || []);
                    setRows(data.rows);
                    setFileName(data.fileName || 'dispatch_data.csv');
                    setPage(0);
                }
            }
        } catch (err) {
            console.error('Error fetching dispatch data from database:', err);
        } finally {
            setLoadingFromDb(false);
        }
    };

    // Save CSV to database and populate table
    const saveDispatchToDb = async (fileTitle: string, parsedHeaders: string[], parsedRows: string[][]) => {
        setSavingToDb(true);
        setParseError(null);
        try {
            let userStr = null;
            try {
                userStr = localStorage.getItem('staffUser');
            } catch (e) {}
            const user = userStr ? JSON.parse(userStr) : null;
            const uploader = user?.username || user?.fullName || user?.email || 'staff';

            const res = await fetch(`${API_ENDPOINTS.DISPATCH_VIEW}/upload`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName: fileTitle,
                    headers: parsedHeaders,
                    rows: parsedRows,
                    uploadedBy: uploader,
                }),
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Failed to save CSV to database');
            }

            // Populate table from the saved database data
            setHeaders(parsedHeaders);
            setRows(parsedRows);
            setFileName(fileTitle);
            setPage(0);
            setSortColumnIndex(null);
            setStartDate('');
            setEndDate('');
            setSelectedDateColIdx('auto');
            setSnackbarMessage(`CSV successfully saved to database with ${parsedRows.length.toLocaleString()} rows and ${parsedHeaders.length} columns!`);
        } catch (err: any) {
            console.error('Save to database error:', err);
            setParseError(err.message || 'Failed to save CSV to database.');
            setHeaders(parsedHeaders);
            setRows(parsedRows);
            setFileName(fileTitle);
        } finally {
            setSavingToDb(false);
        }
    };

    // Handle File Process and Save to Database
    const handleProcessFile = (file: File) => {
        setParseError(null);
        if (!file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.txt') && !file.name.toLowerCase().endsWith('.tsv')) {
            setParseError('Please upload a valid CSV file (.csv, .tsv, or .txt).');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target?.result as string;
                const parsed = parseCSV(text);
                if (parsed.error) {
                    setParseError(parsed.error);
                    return;
                }
                await saveDispatchToDb(file.name, parsed.headers, parsed.rows);
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

    // Load Sample Data and Save to Database
    const handleLoadSampleData = async () => {
        const parsed = parseCSV(SAMPLE_DISPATCH_CSV);
        await saveDispatchToDb('sample_dispatch_manifest.csv', parsed.headers, parsed.rows);
    };

    // Clear uploaded CSV and remove from database
    const handleClearData = async () => {
        setHeaders([]);
        setRows([]);
        setFileName('');
        setParseError(null);
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
        setSelectedDateColIdx('auto');
        setPage(0);
        setSortColumnIndex(null);
        try {
            await fetch(API_ENDPOINTS.DISPATCH_VIEW, { method: 'DELETE' });
            setSnackbarMessage('Dispatch data cleared from database.');
        } catch (err) {
            console.error('Error clearing database dispatch data:', err);
        }
    };

    // Sorting handler
    const handleRequestSort = (columnIndex: number) => {
        const isAsc = sortColumnIndex === columnIndex && sortDirection === 'asc';
        setSortDirection(isAsc ? 'desc' : 'asc');
        setSortColumnIndex(columnIndex);
    };

    // Detect likely date columns from headers & sample values
    const dateColumnOptions = useMemo(() => {
        if (headers.length === 0) return [];
        const options: { index: number; name: string; score: number }[] = [];

        headers.forEach((header, idx) => {
            const lower = header.toLowerCase();
            let score = 0;
            if (lower.includes('date')) score += 10;
            if (lower.includes('dispatch') || lower.includes('delivery') || lower.includes('booking') || lower.includes('created') || lower.includes('order')) score += 5;

            // Sample first 30 rows
            let sampleValidDates = 0;
            const sampleLimit = Math.min(rows.length, 30);
            for (let r = 0; r < sampleLimit; r++) {
                if (rows[r] && rows[r][idx] && parseToDateStr(rows[r][idx])) {
                    sampleValidDates++;
                }
            }
            if (sampleValidDates > 0) {
                score += Math.round((sampleValidDates / sampleLimit) * 20);
            }

            if (score > 0 || sampleValidDates > 0) {
                options.push({ index: idx, name: header, score });
            }
        });

        options.sort((a, b) => b.score - a.score);
        return options;
    }, [headers, rows]);

    // Active date column name for display
    const activeDateColumnName = useMemo(() => {
        if (selectedDateColIdx !== 'auto' && typeof selectedDateColIdx === 'number' && selectedDateColIdx >= 0 && selectedDateColIdx < headers.length) {
            return headers[selectedDateColIdx];
        }
        if (dateColumnOptions.length > 0) {
            return dateColumnOptions[0].name;
        }
        return null;
    }, [selectedDateColIdx, dateColumnOptions, headers]);

    // Filter and sort rows (Search + Date Range + Sort)
    const filteredRows = useMemo(() => {
        let result = rows;

        // 1. Date Range Filtering
        if (startDate || endDate) {
            const targetColIndices: number[] = [];
            if (selectedDateColIdx !== 'auto' && typeof selectedDateColIdx === 'number' && selectedDateColIdx >= 0 && selectedDateColIdx < headers.length) {
                targetColIndices.push(selectedDateColIdx);
            } else if (dateColumnOptions.length > 0) {
                targetColIndices.push(dateColumnOptions[0].index);
            } else {
                // If no date column detected automatically, inspect all columns
                headers.forEach((_, idx) => targetColIndices.push(idx));
            }

            result = result.filter(row => {
                return targetColIndices.some(colIdx => {
                    const cellVal = row[colIdx];
                    const dateStr = parseToDateStr(cellVal);
                    if (!dateStr) return false;
                    if (startDate && dateStr < startDate) return false;
                    if (endDate && dateStr > endDate) return false;
                    return true;
                });
            });
        }

        // 2. Search filtering across all cells
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            result = result.filter(row => row.some(cell => cell.toLowerCase().includes(q)));
        }

        // 3. Column Sorting
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
    }, [rows, headers, searchQuery, startDate, endDate, selectedDateColIdx, dateColumnOptions, sortColumnIndex, sortDirection]);

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
                                Upload and inspect dispatch CSV manifests with database persistence and real-time tabular analysis
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Top Action Buttons */}
                <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                    {headers.length === 0 ? (
                        <Button
                            variant="outlined"
                            startIcon={savingToDb ? <CircularProgress size={16} /> : <PlayArrowIcon />}
                            onClick={handleLoadSampleData}
                            disabled={savingToDb}
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
                                Export CSV ({filteredRows.length.toLocaleString()})
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
                        startIcon={savingToDb ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={savingToDb}
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
                        {savingToDb ? 'Saving to Database...' : (headers.length > 0 ? 'Upload New CSV' : 'Upload CSV')}
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

            {/* Saving to Database Banner */}
            {savingToDb && (
                <Alert
                    severity="info"
                    icon={<CircularProgress size={18} color="inherit" />}
                    sx={{ mb: 3, borderRadius: '10px' }}
                >
                    Saving CSV records to database and populating table... Please wait a moment.
                </Alert>
            )}

            {/* Parse / Save Error Alert */}
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
            {headers.length === 0 && !loadingFromDb && (
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
                        Uploaded files are saved directly into the database and immediately populate this table.
                    </Typography>
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        <Chip label=".CSV" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                        <Chip label=".TSV" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                        <Chip label="Database Saved" size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
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
                {/* Search & Filter Toolbar */}
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    {/* Top Row: Search Bar & Date Range Filters */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', lg: 'row' },
                            alignItems: { xs: 'stretch', lg: 'center' },
                            justifyContent: 'space-between',
                            gap: 2,
                        }}
                    >
                        {/* Search Input */}
                        <TextField
                            size="small"
                            placeholder="Search across all CSV columns and rows..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setPage(0);
                            }}
                            disabled={headers.length === 0 || loadingFromDb}
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
                                minWidth: { xs: '100%', sm: 280, md: 320 },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: '10px',
                                }
                            }}
                        />

                        {/* Date Range Filter Group */}
                        {headers.length > 0 && !loadingFromDb && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    flexWrap: 'wrap',
                                }}
                            >
                                {/* Column Selector if multiple date columns */}
                                {dateColumnOptions.length > 1 && (
                                    <FormControl size="small" sx={{ minWidth: 150 }}>
                                        <InputLabel id="date-col-label" sx={{ fontSize: '0.825rem' }}>Date Column</InputLabel>
                                        <Select
                                            labelId="date-col-label"
                                            value={selectedDateColIdx}
                                            label="Date Column"
                                            onChange={(e) => {
                                                setSelectedDateColIdx(e.target.value as any);
                                                setPage(0);
                                            }}
                                            sx={{ borderRadius: '10px', fontSize: '0.825rem' }}
                                        >
                                            <MenuItem value="auto" sx={{ fontSize: '0.825rem' }}>
                                                <em>Auto ({dateColumnOptions[0]?.name})</em>
                                            </MenuItem>
                                            {dateColumnOptions.map((opt) => (
                                                <MenuItem key={opt.index} value={opt.index} sx={{ fontSize: '0.825rem' }}>
                                                    {opt.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}

                                {/* Date Inputs with DateRange Icon */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        bgcolor: mode === 'light' ? '#f8fafc' : 'rgba(255,255,255,0.03)',
                                        p: 0.75,
                                        px: 1.25,
                                        borderRadius: '10px',
                                        border: '1px solid',
                                        borderColor: (startDate || endDate) ? 'primary.main' : 'divider',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <Tooltip title={activeDateColumnName ? `Filtering by date on "${activeDateColumnName}"` : 'Date Range Filter'}>
                                        <DateRangeIcon sx={{ color: (startDate || endDate) ? 'primary.main' : 'text.secondary', fontSize: 20 }} />
                                    </Tooltip>

                                    <TextField
                                        size="small"
                                        type="date"
                                        label="Start Date"
                                        value={startDate}
                                        onChange={(e) => {
                                            setStartDate(e.target.value);
                                            setPage(0);
                                        }}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            width: 140,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                fontSize: '0.825rem',
                                            },
                                            '& input': { py: 0.75 }
                                        }}
                                    />

                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                        to
                                    </Typography>

                                    <TextField
                                        size="small"
                                        type="date"
                                        label="End Date"
                                        value={endDate}
                                        onChange={(e) => {
                                            setEndDate(e.target.value);
                                            setPage(0);
                                        }}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            width: 140,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '8px',
                                                fontSize: '0.825rem',
                                            },
                                            '& input': { py: 0.75 }
                                        }}
                                    />

                                    {(startDate || endDate) && (
                                        <Tooltip title="Clear date range">
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setStartDate('');
                                                    setEndDate('');
                                                    setPage(0);
                                                }}
                                                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                                            >
                                                <ClearIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </Box>

                    {/* Bottom Row: Active Filter badges & Results Summary */}
                    {headers.length > 0 && !loadingFromDb && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                    Showing {paginatedRows.length} of {filteredRows.length.toLocaleString()} rows ({headers.length} columns)
                                </Typography>

                                {(startDate || endDate) && (
                                    <Chip
                                        icon={<DateRangeIcon sx={{ fontSize: '15px !important' }} />}
                                        label={`Date: ${startDate || 'Any'} to ${endDate || 'Any'}${activeDateColumnName ? ` (${activeDateColumnName})` : ''}`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                        onDelete={() => {
                                            setStartDate('');
                                            setEndDate('');
                                            setPage(0);
                                        }}
                                        sx={{ borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}
                                    />
                                )}

                                {searchQuery && (
                                    <Chip
                                        label={`Search: "${searchQuery}"`}
                                        size="small"
                                        onDelete={() => setSearchQuery('')}
                                        sx={{ borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}
                                    />
                                )}

                                {sortColumnIndex !== null && (
                                    <Chip
                                        label={`Sorted: ${headers[sortColumnIndex]} (${sortDirection.toUpperCase()})`}
                                        size="small"
                                        onDelete={() => setSortColumnIndex(null)}
                                        sx={{ borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600 }}
                                    />
                                )}
                            </Box>

                            {(startDate || endDate || searchQuery || sortColumnIndex !== null) && (
                                <Button
                                    size="small"
                                    onClick={() => {
                                        setStartDate('');
                                        setEndDate('');
                                        setSearchQuery('');
                                        setSortColumnIndex(null);
                                        setPage(0);
                                    }}
                                    sx={{ textTransform: 'none', fontSize: '0.75rem', color: 'text.secondary', fontWeight: 500 }}
                                >
                                    Reset Filters
                                </Button>
                            )}
                        </Box>
                    )}
                </Box>

                {/* Loading state from DB */}
                {loadingFromDb ? (
                    <Box sx={{ p: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <CircularProgress size={36} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            Loading dispatch records from database...
                        </Typography>
                    </Box>
                ) : headers.length === 0 ? (
                    <Box sx={{ p: 8, textAlign: 'center' }}>
                        <TableViewIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5, opacity: 0.6 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                            No CSV File in Database Yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 460, mx: 'auto', mb: 3 }}>
                            Upload your dispatch spreadsheet or try our sample data. Data will be saved directly into the database and populate here.
                        </Typography>
                        <Stack direction="row" spacing={2} justifyContent="center">
                            <Button
                                variant="contained"
                                startIcon={<UploadFileIcon />}
                                onClick={() => fileInputRef.current?.click()}
                                disabled={savingToDb}
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
                                disabled={savingToDb}
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
                            {startDate || endDate
                                ? `No records match the selected date range (${startDate || 'Any'} to ${endDate || 'Any'})${searchQuery ? ` and search term "${searchQuery}"` : ''}.`
                                : `No rows matched your search query "${searchQuery}".`}
                        </Typography>
                        <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                                setSearchQuery('');
                                setStartDate('');
                                setEndDate('');
                                setPage(0);
                            }}
                            sx={{ borderRadius: '8px', textTransform: 'none' }}
                        >
                            Reset All Filters
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

            {/* Notification Snackbar */}
            <Snackbar
                open={Boolean(snackbarMessage)}
                autoHideDuration={4000}
                onClose={() => setSnackbarMessage(null)}
                message={snackbarMessage}
            />
        </Box>
    );
}
