import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/project.scss';

// Remove formula-related icons
import { FaTable, FaSort, FaSortUp, FaSortDown, 
         FaFilter, FaDownload, FaPlus, FaMinus, FaTrash, 
         FaPen, FaEye, FaEyeSlash, FaBars, FaTimes, FaSave,
         FaInfoCircle, FaCalendarAlt, FaUser, FaClock } from 'react-icons/fa';

const Project = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const sidebarRef = useRef(null);
  
  // Table state
  const [activeTable, setActiveTable] = useState(0);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState('text');
  
  // Add table modal state
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  
  // Delete state
  const [showDeleteColumnSection, setShowDeleteColumnSection] = useState(false);
  const [showDeleteRowSection, setShowDeleteRowSection] = useState(false);
  
  // Rename column state
  const [showRenameColumnModal, setShowRenameColumnModal] = useState(false);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);
  const [sortConfig, setSortConfig] = useState({ column: null, direction: 'asc' });
  
  // Rename table state
  const [showRenameTableModal, setShowRenameTableModal] = useState(false);
  const [selectedTableIndex, setSelectedTableIndex] = useState(null);
  
  // Add Excel-like features
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [selectedCell, setSelectedCell] = useState({ row: null, column: null });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarView, setSidebarView] = useState('info'); // 'tables', 'columns', 'rows', 'info'
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [freezeColumns, setFreezeColumns] = useState([]);
  const [showExcelExportModal, setShowExcelExportModal] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  
  // Initialize with default columns if needed
  const defaultColumns = [
    { name: 'Name', type: 'text' },
    { name: 'Created At', type: 'date' },
    { name: 'Value', type: 'number' }
  ];

  useEffect(() => {
    fetchProject();
    
    // Handle resize events for responsive design
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth > 1200) {
        setIsSidebarOpen(true);
      } else if (isSidebarOpen && window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Handle clicks outside sidebar to close it on mobile
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          isMobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [id, isMobile, isSidebarOpen]);

  // Add warning before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const fetchProject = async () => {
    if (!id || id === 'undefined') {
      setError('Invalid project ID');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get(`/api/projects/${id}`);
      console.log('API Response for project:', response);
      
      // Extract project data from response
      let projectData = null;
      
      if (response.data && response.data.data) {
        projectData = response.data.data;
      } else if (response.data && (response.data._id || response.data.id)) {
        projectData = response.data;
      }
      
      if (!projectData) {
        setError('Could not find project data in the response');
        setIsLoading(false);
        return;
      }
      
      // Ensure tables exist in the project
      if (!projectData.tables || !Array.isArray(projectData.tables) || projectData.tables.length === 0) {
        // Initialize with a default table
        projectData.tables = [{
          name: 'Table 1',
          columns: defaultColumns,
          rows: []
        }];
      }
      
      // Ensure each table has the required columns
      projectData.tables.forEach(table => {
        if (!table.columns || !Array.isArray(table.columns) || table.columns.length === 0) {
          table.columns = defaultColumns;
        }
        if (!table.rows || !Array.isArray(table.rows)) {
          table.rows = [];
        }
      });
      
      setProject(projectData);
      setIsLoading(false);
      setHasUnsavedChanges(false); // Reset unsaved changes flag after loading
    } catch (err) {
      console.error(`Error fetching project ${id}:`, err);
      setError('Failed to load project. Please try again later.');
      setIsLoading(false);
    }
  };

  // Remove formula-related functions and keep only the necessary ones
  const handleCellChange = async (rowIndex, columnId, value) => {
    try {
      const updatedProject = { ...project };
      const row = updatedProject.tables[activeTable].rows[rowIndex];
      
      let cell = row.cells.find(cell => cell.columnId === columnId);
      if (!cell) {
        cell = { columnId, value };
        row.cells.push(cell);
      } else {
        cell.value = value;
      }
      
      setProject(updatedProject);
      setHasUnsavedChanges(true);
    } catch (err) {
      console.error('Error updating cell:', err);
    }
  };

  const handleAddTable = async () => {
    if (!newTableName.trim()) {
      alert('Please enter a table name');
      return;
    }

    try {
      // Create a new table with default columns
      const newTable = {
        name: newTableName,
        columns: [
          { name: 'Name', type: 'text' },
          { name: 'Created At', type: 'date' },
          { name: 'Value', type: 'number' }
        ],
        rows: []
      };

      // Add to current project state
      const updatedProject = { ...project };
      updatedProject.tables.push(newTable);
      
      // Set active table to the new table
      const newTableIndex = updatedProject.tables.length - 1;
      
      setProject(updatedProject);
      setActiveTable(newTableIndex);
      setHasUnsavedChanges(true);
      
      // Reset modal state
      setNewTableName('');
      setShowAddTableModal(false);
      
      // Save changes to database immediately
      try {
        setIsSaving(true);
        await api.put(`/api/projects/${id}`, updatedProject);
        setHasUnsavedChanges(false);
        setIsSaving(false);
        
        // Show success message
        alert('New table added and saved successfully!');
      } catch (saveErr) {
        console.error('Error saving project:', saveErr);
        setIsSaving(false);
        alert('Table added but failed to save to database. Please save changes manually.');
      }
    } catch (err) {
      console.error('Error adding table:', err);
      alert('Failed to add table. Please try again.');
    }
  };

  const handleAddColumn = async () => {
    if (!newColumnName) {
      alert('Please enter a column name');
      return;
    }

    try {
      // Create a new column
      const newColumn = {
        name: newColumnName,
        type: newColumnType
      };

      // Add to current project state
      const updatedProject = { ...project };
      updatedProject.tables[activeTable].columns.push(newColumn);
      
      setProject(updatedProject);
      setHasUnsavedChanges(true);
      
      // Reset modal state
      setNewColumnName('');
      setNewColumnType('text');
      setShowAddColumnModal(false);
    } catch (err) {
      console.error('Error adding column:', err);
      alert('Failed to add column. Please try again.');
    }
  };

  const handleDeleteColumn = (columnIndex) => {
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete the column "${project.tables[activeTable].columns[columnIndex].name}"? This will remove all data in this column.`)) {
      return;
    }

    try {
      const updatedProject = { ...project };
      const columnToDelete = updatedProject.tables[activeTable].columns[columnIndex].name;
      
      // Remove the column from columns array
      updatedProject.tables[activeTable].columns.splice(columnIndex, 1);
      
      // Remove the column data from all rows
      updatedProject.tables[activeTable].rows.forEach(row => {
        if (row.cells) {
          // Find and remove the cell with matching columnId
          const cellIndex = row.cells.findIndex(cell => cell.columnId === columnToDelete);
          if (cellIndex !== -1) {
            row.cells.splice(cellIndex, 1);
          }
        }
      });
      
      setProject(updatedProject);
      setHasUnsavedChanges(true);
      
      // If we deleted all columns, hide the delete column section
      if (updatedProject.tables[activeTable].columns.length === 0) {
        setShowDeleteColumnSection(false);
      }
    } catch (err) {
      console.error('Error deleting column:', err);
      alert('Failed to delete column. Please try again.');
    }
  };

  const handleAddRow = async () => {
    try {
      // Create a new empty row
      const newRow = {
        cells: project.tables[activeTable].columns.map(column => ({
          columnId: column.name,
          value: ''
        }))
      };

      // Add to current project state
      const updatedProject = { ...project };
      updatedProject.tables[activeTable].rows.push(newRow);
      
      setProject(updatedProject);
      setHasUnsavedChanges(true);
    } catch (err) {
      console.error('Error adding row:', err);
      alert('Failed to add row. Please try again.');
    }
  };

  const handleDeleteRow = (rowIndex) => {
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete row ${rowIndex + 1}?`)) {
      return;
    }

    try {
      const updatedProject = { ...project };
      
      // Remove the row
      updatedProject.tables[activeTable].rows.splice(rowIndex, 1);
      
      setProject(updatedProject);
      setHasUnsavedChanges(true);
      
      // If we deleted all rows, hide the delete row section
      if (updatedProject.tables[activeTable].rows.length === 0) {
        setShowDeleteRowSection(false);
      }
    } catch (err) {
      console.error('Error deleting row:', err);
      alert('Failed to delete row. Please try again.');
    }
  };

  const saveProject = async () => {
    if (!hasUnsavedChanges) {
      return; // No need to save if there are no changes
    }

    try {
      setIsSaving(true);
      // Save to database
      await api.put(`/api/projects/${id}`, project);
      setHasUnsavedChanges(false);
      setIsSaving(false);
      
      // Show success message
      alert('Project saved successfully!');
    } catch (err) {
      console.error('Error saving project:', err);
      setIsSaving(false);
      alert('Failed to save project. Please try again.');
    }
  };

  const getCellValue = (row, columnId) => {
    if (!row || !row.cells) return '';
    const cell = row.cells.find(cell => cell.columnId === columnId);
    return cell ? cell.value : '';
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSort = (columnName) => {
    let direction = 'asc';
    if (sortConfig.column === columnName && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ column: columnName, direction });

    const updatedProject = { ...project };
    const table = updatedProject.tables[activeTable];
    
    table.rows.sort((a, b) => {
      const aValue = getCellValue(a, columnName);
      const bValue = getCellValue(b, columnName);
      
      if (direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setProject(updatedProject);
    setHasUnsavedChanges(true);
  };

  const handleRenameColumn = (columnIndex) => {
    setSelectedColumnIndex(columnIndex);
    setNewColumnName(project.tables[activeTable].columns[columnIndex].name);
    setShowRenameColumnModal(true);
  };

  const handleRenameColumnSubmit = async () => {
    if (!newColumnName.trim()) {
      alert('Please enter a column name');
      return;
    }

    try {
      const updatedProject = { ...project };
      const oldColumnName = updatedProject.tables[activeTable].columns[selectedColumnIndex].name;
      
      // Update column name
      updatedProject.tables[activeTable].columns[selectedColumnIndex].name = newColumnName;
      
      // Update all cell references to this column
      updatedProject.tables[activeTable].rows.forEach(row => {
        const cell = row.cells.find(cell => cell.columnId === oldColumnName);
        if (cell) {
          cell.columnId = newColumnName;
        }
      });
      
      setProject(updatedProject);
      setHasUnsavedChanges(true);
      setShowRenameColumnModal(false);
      setNewColumnName('');
      setSelectedColumnIndex(null);
    } catch (err) {
      console.error('Error renaming column:', err);
      alert('Failed to rename column. Please try again.');
    }
  };

  const addIndexColumn = async () => {
    try {
      const updatedProject = { ...project };
      const table = updatedProject.tables[activeTable];
      
      // Add index column if it doesn't exist
      if (!table.columns.some(col => col.name === 'Index')) {
        const indexColumn = {
          name: 'Index',
          type: 'number'
        };
        
        // Add column to columns array
        table.columns.unshift(indexColumn);
        
        // Add index values to all rows
        table.rows.forEach((row, index) => {
          const indexCell = {
            columnId: 'Index',
            value: (index + 1).toString()
          };
          row.cells.unshift(indexCell);
        });
        
        setProject(updatedProject);
        setHasUnsavedChanges(true);
      }
    } catch (err) {
      console.error('Error adding index column:', err);
      alert('Failed to add index column. Please try again.');
    }
  };

  const handleRenameTable = (tableIndex) => {
    setSelectedTableIndex(tableIndex);
    setNewTableName(project.tables[tableIndex].name);
    setShowRenameTableModal(true);
  };

  const handleRenameTableSubmit = () => {
    if (!newTableName.trim()) {
      alert('Please enter a table name');
      return;
    }
    const updatedProject = { ...project };
    updatedProject.tables[selectedTableIndex].name = newTableName;
    setProject(updatedProject);
    setHasUnsavedChanges(true);
    setShowRenameTableModal(false);
    setNewTableName('');
    setSelectedTableIndex(null);
  };

  const handleDeleteTable = (tableIndex) => {
    if (project.tables.length === 1) {
      alert('You must have at least one table.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete table '${project.tables[tableIndex].name}'?`)) {
      return;
    }
    const updatedProject = { ...project };
    updatedProject.tables.splice(tableIndex, 1);
    let newActive = activeTable;
    if (tableIndex === activeTable) {
      newActive = 0;
    } else if (tableIndex < activeTable) {
      newActive = activeTable - 1;
    }
    setProject(updatedProject);
    setActiveTable(newActive);
    setHasUnsavedChanges(true);
  };

  // Excel-like custom formatting for cells
  const getFormattedCellValue = (value, type) => {
    if (!value) return '';
    
    if (type === 'number') {
      // Format as number with 2 decimal places
      return parseFloat(value).toLocaleString(undefined, { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } else if (type === 'date') {
      // Format as date
      try {
        const date = new Date(value);
        return date.toLocaleDateString();
      } catch (e) {
        return value;
      }
    }
    
    return value;
  };
  
  // Cell selection logic
  const handleCellSelect = (rowIndex, columnId) => {
    setSelectedCell({ row: rowIndex, column: columnId });
  };
  
  // Duplicate row
  const duplicateRow = (rowIndex) => {
    const updatedProject = { ...project };
    const rowToDuplicate = updatedProject.tables[activeTable].rows[rowIndex];
    
    // Create a deep copy of the row
    const newRow = {
      cells: rowToDuplicate.cells.map(cell => ({
        columnId: cell.columnId,
        value: cell.value
      }))
    };
    
    // Insert after the selected row
    updatedProject.tables[activeTable].rows.splice(rowIndex + 1, 0, newRow);
    
    setProject(updatedProject);
    setHasUnsavedChanges(true);
  };
  
  // Insert row above
  const insertRowAbove = (rowIndex) => {
    const updatedProject = { ...project };
    
    // Create empty row
    const newRow = {
      cells: updatedProject.tables[activeTable].columns.map(column => ({
        columnId: column.name,
        value: ''
      }))
    };
    
    // Insert at position
    updatedProject.tables[activeTable].rows.splice(rowIndex, 0, newRow);
    
    setProject(updatedProject);
    setHasUnsavedChanges(true);
  };
  
  // Insert row below
  const insertRowBelow = (rowIndex) => {
    const updatedProject = { ...project };
    
    // Create empty row
    const newRow = {
      cells: updatedProject.tables[activeTable].columns.map(column => ({
        columnId: column.name,
        value: ''
      }))
    };
    
    // Insert after position
    updatedProject.tables[activeTable].rows.splice(rowIndex + 1, 0, newRow);
    
    setProject(updatedProject);
    setHasUnsavedChanges(true);
  };

  if (isLoading) {
    return (
      <div className="project-container">
        <div className="loading">Loading project data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="project-container">
        <div className="error">{error}</div>
        <button className="back-btn" onClick={() => navigate('/projects')}>
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-container">
        <div className="error">Project not found</div>
        <button className="back-btn" onClick={() => navigate('/projects')}>
          Back to Projects
        </button>
      </div>
    );
  }

  const currentTable = project.tables[activeTable];

  return (
    <div className="project-container">
      {/* Sidebar */}
      <div ref={sidebarRef} className={`project-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Project Details</h3>
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>
        
        {/* Sidebar Navigation - Add Project Info option */}
        <div className="sidebar-nav">
          <button 
            className={`nav-btn ${sidebarView === 'info' ? 'active' : ''}`}
            onClick={() => setSidebarView('info')}
          >
            <FaInfoCircle /> Project Info
          </button>
          <button 
            className={`nav-btn ${sidebarView === 'tables' ? 'active' : ''}`}
            onClick={() => setSidebarView('tables')}
          >
            <FaTable /> Tables
          </button>
          <button 
            className={`nav-btn ${sidebarView === 'columns' ? 'active' : ''}`}
            onClick={() => setSidebarView('columns')}
          >
            <FaSort /> Columns
          </button>
          <button 
            className={`nav-btn ${sidebarView === 'rows' ? 'active' : ''}`}
            onClick={() => setSidebarView('rows')}
          >
            <FaBars /> Rows
          </button>
        </div>
        
        <div className="sidebar-content">
          {/* Project Info View */}
          {sidebarView === 'info' && project && (
            <div className="project-info">
              <div className="info-section">
                <h4>Project Details</h4>
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{project.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Created At:</span>
                  <span className="info-value">
                    {new Date(project.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Updated:</span>
                  <span className="info-value">
                    {new Date(project.updatedAt).toLocaleString()}
                  </span>
                </div>
                {project.createdBy && (
                  <div className="info-item">
                    <span className="info-label">Created By:</span>
                    <span className="info-value">{project.createdBy}</span>
                  </div>
                )}
              </div>

              <div className="info-section">
                <h4>Statistics</h4>
                <div className="info-item">
                  <span className="info-label">Total Tables:</span>
                  <span className="info-value">{project.tables.length}</span>
                </div>
                {project.tables.map((table, index) => (
                  <div key={index} className="table-stats">
                    <div className="info-item">
                      <span className="info-label">Table {index + 1}:</span>
                      <span className="info-value">{table.name}</span>
                    </div>
                    <div className="info-item sub-item">
                      <span className="info-label">Columns:</span>
                      <span className="info-value">{table.columns.length}</span>
                    </div>
                    <div className="info-item sub-item">
                      <span className="info-label">Rows:</span>
                      <span className="info-value">{table.rows.length}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="info-section">
                <h4>Actions</h4>
                <button 
                  className="action-btn"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this project?')) {
                      // Add delete project functionality
                      console.log('Delete project');
                    }
                  }}
                >
                  <FaTrash /> Delete Project
                </button>
                <button 
                  className="action-btn"
                  onClick={() => {
                    // Add duplicate project functionality
                    console.log('Duplicate project');
                  }}
                >
                  <FaPlus /> Duplicate Project
                </button>
              </div>
            </div>
          )}

          {/* Tables View */}
          {sidebarView === 'tables' && (
            <div className="table-manager">
              <h4>Tables</h4>
              <ul className="tables-list">
                {project.tables.map((table, index) => (
                  <li 
                    key={index}
                    className={index === activeTable ? 'active' : ''}
                    onClick={() => setActiveTable(index)}
                  >
                    <FaTable className="table-icon" />
                    <span className="table-name">{table.name}</span>
                    <div className="table-actions">
                      <button
                        className="rename-btn"
                        onClick={e => { e.stopPropagation(); handleRenameTable(index); }}
                        title={`Rename table '${table.name}'`}
                      >
                        <FaPen size={14} />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={e => { e.stopPropagation(); handleDeleteTable(index); }}
                        title={`Delete table '${table.name}'`}
                        disabled={project.tables.length === 1}
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <button 
                className="add-table-btn" 
                onClick={() => setShowAddTableModal(true)}
              >
                <FaPlus /> Add New Table
              </button>
              
              {/* Excel Export Button */}
              <button 
                className="excel-export-btn" 
                onClick={() => setShowExcelExportModal(true)}
              >
                <FaDownload /> Export to Excel
              </button>
            </div>
          )}
          
          {/* Columns View */}
          {sidebarView === 'columns' && (
            <div className="column-manager">
              <h4>Column Management</h4>
              <button 
                className="add-column-btn"
                onClick={() => setShowAddColumnModal(true)}
              >
                <FaPlus /> Add Column
              </button>
              <button 
                className="add-index-btn"
                onClick={addIndexColumn}
              >
                <FaPlus /> Add Index Column
              </button>
              
              <h5>Current Columns</h5>
              <div className="columns-list">
                {currentTable.columns.map((column, index) => (
                  <div key={index} className="column-item">
                    <div className="column-info">
                      <span className="column-type-icon">
                        {column.type === 'text' && 'Aa'}
                        {column.type === 'number' && '123'}
                        {column.type === 'date' && '📅'}
                        {column.type === 'boolean' && '✓✗'}
                      </span>
                      <span className="column-name">{column.name}</span>
                      <span className="column-type">({column.type})</span>
                    </div>
                    <div className="column-actions">
                      <button
                        className="sort-btn"
                        onClick={() => handleSort(column.name)}
                        title={`Sort by ${column.name}`}
                      >
                        {sortConfig.column === column.name ? 
                          (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : 
                          <FaSort />}
                      </button>
                      <button
                        className="visibility-btn"
                        onClick={() => toggleColumnVisibility(column.name)}
                        title={hiddenColumns.includes(column.name) ? 
                          `Show ${column.name}` : `Hide ${column.name}`}
                      >
                        {hiddenColumns.includes(column.name) ? 
                          <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button
                        className="rename-btn"
                        onClick={() => handleRenameColumn(index)}
                        title={`Rename ${column.name}`}
                      >
                        <FaPen />
                      </button>
                      {/* Delete button */}
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteColumn(index)}
                        title={`Delete column '${column.name}'`}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <h5>Column Actions</h5>
              <div className="column-actions-group">
                <button 
                  className="filter-btn"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                <button 
                  className="freeze-columns-btn"
                  onClick={() => alert('Freeze columns functionality would be implemented here')}
                >
                  Freeze First Column
                </button>
              </div>
            </div>
          )}
          
          {/* Rows View */}
          {sidebarView === 'rows' && (
            <div className="row-manager">
              <h4>Row Management</h4>
              <button 
                className="add-row-btn"
                onClick={handleAddRow}
              >
                <FaPlus /> Add Row
              </button>
              
              {currentTable.rows.length > 0 && (
                <>
                  <h5>Quick Row Actions</h5>
                  <div className="row-actions-group">
                    <button 
                      className="duplicate-row-btn"
                      onClick={() => {
                        if (selectedCell.row !== null) {
                          duplicateRow(selectedCell.row);
                        } else {
                          alert('Please select a row first');
                        }
                      }}
                      disabled={selectedCell.row === null}
                    >
                      Duplicate Selected Row
                    </button>
                    <button 
                      className="insert-above-btn"
                      onClick={() => {
                        if (selectedCell.row !== null) {
                          insertRowAbove(selectedCell.row);
                        } else {
                          alert('Please select a row first');
                        }
                      }}
                      disabled={selectedCell.row === null}
                    >
                      Insert Above Selected
                    </button>
                    <button 
                      className="insert-below-btn"
                      onClick={() => {
                        if (selectedCell.row !== null) {
                          insertRowBelow(selectedCell.row);
                        } else {
                          alert('Please select a row first');
                        }
                      }}
                      disabled={selectedCell.row === null}
                    >
                      Insert Below Selected
                    </button>
                  </div>
                  
                  <h5>Current Rows</h5>
                  <div className="rows-list">
                    {currentTable.rows.map((row, index) => {
                      // Show preview: first non-empty cell value or row number
                      let preview = `Row ${index + 1}`;
                      if (row.cells && row.cells.length > 0) {
                        const firstCell = row.cells.find(cell => cell.value);
                        if (firstCell && firstCell.value) {
                          preview = `${firstCell.value.toString().substring(0, 15)}${firstCell.value.length > 15 ? '...' : ''}`;
                        }
                      }
                      return (
                        <div 
                          key={index} 
                          className={`row-item ${selectedCell.row === index ? 'selected' : ''}`}
                          onClick={() => setSelectedCell({ row: index, column: null })}
                        >
                          <span className="row-number">{index + 1}</span>
                          <span className="row-preview">{preview}</span>
                          <div className="row-actions">
                            <button
                              className="duplicate-btn"
                              onClick={(e) => { e.stopPropagation(); duplicateRow(index); }}
                              title={`Duplicate row ${index + 1}`}
                            >
                              <FaPlus />
                            </button>
                            <button
                              className="delete-btn"
                              onClick={(e) => { e.stopPropagation(); handleDeleteRow(index); }}
                              title={`Delete row ${index + 1}`}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
              
              {currentTable.rows.length === 0 && (
                <div className="empty-table-message">
                  No rows yet. Click "Add Row" to get started.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`project-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Sidebar Toggle Button (moves with sidebar) */}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {/* Text handled by CSS ::after pseudo-element */}
        </button>
        
        <div className="project-header">
          <h2>{project.name}</h2>
          <div className="table-name">{currentTable.name}</div>
          
          <div className="actions">
            <button 
              className={`save-btn ${hasUnsavedChanges ? 'has-changes' : ''}`} 
              onClick={saveProject}
              disabled={isSaving || !hasUnsavedChanges}
            >
              {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
            </button>
            <button className="back-btn" onClick={() => {
              if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                return;
              }
              navigate('/projects');
            }}>
              Back to Projects
            </button>
          </div>
        </div>
        
        {/* Excel-like toolbar */}
        <div className="excel-toolbar">
          <div className="toolbar-group">
            <button 
              className="toolbar-btn"
              onClick={handleAddRow}
              title="Add Row"
            >
              <FaPlus /> Row
            </button>
            <button 
              className="toolbar-btn"
              onClick={() => setShowAddColumnModal(true)}
              title="Add Column"
            >
              <FaPlus /> Column
            </button>
          </div>
          
          <div className="toolbar-group">
            <button 
              className="toolbar-btn"
              onClick={() => setShowFilters(!showFilters)}
              title={showFilters ? "Hide Filters" : "Show Filters"}
            >
              <FaFilter />
            </button>
            <button 
              className="toolbar-btn"
              onClick={() => setShowExcelExportModal(true)}
              title="Export to Excel"
            >
              <FaDownload />
            </button>
          </div>
          
          <div className="toolbar-group">
            <button 
              className="toolbar-btn save-btn"
              onClick={saveProject}
              disabled={!hasUnsavedChanges}
            >
              <FaSave /> {hasUnsavedChanges ? "Save" : "Saved"}
            </button>
          </div>
        </div>
        
        {/* Filters row */}
        {showFilters && (
          <div className="filters-row">
            <div className="filter-controls">
              {currentTable.columns.map((column, colIndex) => (
                <div key={colIndex} className="filter-item">
                  <label>{column.name}</label>
                  <input 
                    type="text" 
                    placeholder={`Filter ${column.name}`}
                    value={filters[column.name] || ''}
                    onChange={(e) => {
                      const updatedFilters = {...filters};
                      updatedFilters[column.name] = e.target.value;
                      setFilters(updatedFilters);
                    }}
                  />
                </div>
              ))}
              <button className="apply-filters-btn" onClick={applyFilters}>
                Apply Filters
              </button>
            </div>
          </div>
        )}
        
        {hasUnsavedChanges && (
          <div className="unsaved-changes-alert">
            You have unsaved changes. <button onClick={saveProject}>Save now</button>
          </div>
        )}
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th className="row-number-header">Nr.</th>
                {currentTable.columns.map((column, colIndex) => (
                  !hiddenColumns.includes(column.name) && (
                    <th 
                      key={colIndex}
                      className={freezeColumns.includes(column.name) ? 'freeze-column' : ''}
                    >
                      <div className="column-header">
                        <span className="column-name">{column.name}</span>
                        <div className="column-actions">
                          <button 
                            className="sort-btn"
                            onClick={() => handleSort(column.name)}
                          >
                            {sortConfig.column === column.name ? 
                              (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />) : 
                              <FaSort />}
                          </button>
                        </div>
                      </div>
                    </th>
                  )
                ))}
              </tr>
            </thead>
            <tbody>
              {currentTable.rows.length === 0 ? (
                <tr>
                  <td colSpan={currentTable.columns.filter(col => !hiddenColumns.includes(col.name)).length + 1} className="empty-table">
                    No data yet. Add rows to get started.
                  </td>
                </tr>
              ) : (
                currentTable.rows.map((row, rowIndex) => (
                  <tr 
                    key={rowIndex}
                    className={selectedCell.row === rowIndex ? 'selected-row' : ''}
                  >
                    <td className="row-number">{rowIndex + 1}</td>
                    {currentTable.columns.map((column, colIndex) => (
                      !hiddenColumns.includes(column.name) && (
                        <td 
                          key={colIndex}
                          className={`
                            ${freezeColumns.includes(column.name) ? 'freeze-column' : ''}
                            ${selectedCell.row === rowIndex && selectedCell.column === column.name ? 'selected-cell' : ''}
                            ${column.type}
                          `}
                          onClick={() => handleCellSelect(rowIndex, column.name)}
                          onDoubleClick={() => setEditingCell({ row: rowIndex, column: column.name })}
                        >
                          {editingCell && 
                           editingCell.row === rowIndex && 
                           editingCell.column === column.name ? (
                            <input
                              type={column.type === 'number' ? 'number' : 'text'}
                              value={getCellValue(row, column.name)}
                              onChange={(e) => handleCellChange(rowIndex, column.name, e.target.value)}
                              onBlur={() => setEditingCell(null)}
                              autoFocus
                            />
                          ) : (
                            <span>
                              {getFormattedCellValue(getCellValue(row, column.name), column.type)}
                            </span>
                          )}
                        </td>
                      )
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add Column Modal */}
      {showAddColumnModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Column</h3>
              <button 
                className="close-modal-btn" 
                onClick={() => setShowAddColumnModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Column Name:</label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Enter column name"
                />
              </div>
              <div className="form-group">
                <label>Column Type:</label>
                <select
                  value={newColumnType}
                  onChange={(e) => setNewColumnType(e.target.value)}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="boolean">Yes/No</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowAddColumnModal(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn" 
                onClick={handleAddColumn}
              >
                Add Column
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Table Modal */}
      {showAddTableModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Table</h3>
              <button 
                className="close-modal-btn" 
                onClick={() => setShowAddTableModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Table Name:</label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="Enter table name"
                  autoFocus
                />
              </div>
              <p className="modal-info">
                This will create a new table with the default columns (Name, Created At, Value). 
                You can add more columns after creating the table.
              </p>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowAddTableModal(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn" 
                onClick={handleAddTable}
              >
                Create Table
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add this new modal for renaming columns */}
      {showRenameColumnModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Rename Column</h3>
              <button 
                className="close-modal-btn" 
                onClick={() => setShowRenameColumnModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>New Column Name:</label>
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Enter new column name"
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowRenameColumnModal(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn" 
                onClick={handleRenameColumnSubmit}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add modal for renaming table */}
      {showRenameTableModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Rename Table</h3>
              <button 
                className="close-modal-btn" 
                onClick={() => setShowRenameTableModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>New Table Name:</label>
                <input
                  type="text"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="Enter new table name"
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowRenameTableModal(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn" 
                onClick={handleRenameTableSubmit}
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Excel Export Modal */}
      {showExcelExportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Export to Excel</h3>
              <button 
                className="close-modal-btn" 
                onClick={() => setShowExcelExportModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Export Options:</label>
                <div className="export-options">
                  <label>
                    <input 
                      type="checkbox" 
                      defaultChecked={true}
                    />
                    Current table only
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      defaultChecked={true}
                    />
                    Include headers
                  </label>
                  <label>
                    <input 
                      type="checkbox" 
                      defaultChecked={false}
                    />
                    Export all tables (as sheets)
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>File Name:</label>
                <input
                  type="text"
                  placeholder="Enter file name"
                  defaultValue={`${project.name}-export`}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowExcelExportModal(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-btn" 
                onClick={exportToExcel}
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;