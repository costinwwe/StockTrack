import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaTable, 
  FaColumns
} from 'react-icons/fa';
import "../styles/sidebar.scss";

const Sidebar = ({ 
  isOpen, 
  onClose, 
  colCount, 
  rowCount, 
  onGridSettingsChange,
  project,
  activeSheet
}) => {
  // Local state for grid settings input
  const [columns, setColumns] = useState(colCount);
  const [rows, setRows] = useState(rowCount);
  
  // Update local state when props change
  useEffect(() => {
    setColumns(colCount);
    setRows(rowCount);
  }, [colCount, rowCount]);

  // Handle grid settings changes
  const handleApplyGridSettings = () => {
    // Validate inputs
    const newColumns = Math.min(Math.max(parseInt(columns) || 10, 1), 100);
    const newRows = Math.min(Math.max(parseInt(rows) || 20, 1), 1000);
    
    // Update grid dimensions
    onGridSettingsChange(newColumns, newRows);
  };

  // Show debugging info about the project
  const getProjectInfo = () => {
    if (!project) return 'Project is null';
    
    const info = [];
    info.push(`Project ID: ${project._id || 'Not set'}`);
    info.push(`Project Name: ${project.name || 'Not set'}`);
    
    if (project.tables) {
      info.push(`Tables: ${Array.isArray(project.tables) ? project.tables.length : 'Not an array'}`);
      
      if (Array.isArray(project.tables) && project.tables.length > 0) {
        const activeTable = project.tables[activeSheet];
        if (activeTable) {
          info.push(`Active Sheet: ${activeTable.name || `Sheet ${activeSheet + 1}`}`);
          info.push(`Columns: ${activeTable.columns ? activeTable.columns.length : 'No columns'}`);
          info.push(`Rows: ${activeTable.rows ? activeTable.rows.length : 'No rows'}`);
        } else {
          info.push(`Active Sheet: Not found (index: ${activeSheet})`);
        }
      }
    } else {
      info.push('Tables: Not defined');
    }
    
    return info.join('\n');
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h3>Spreadsheet Settings</h3>
        <button className="close-btn" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      
      <div className="sidebar-content">
        <div className="settings-section">
          <h4>Grid Dimensions</h4>
          
          <div className="form-group">
            <label htmlFor="columns">Number of Columns:</label>
            <div className="input-with-controls">
              <input 
                type="number" 
                id="columns" 
                min="1" 
                max="100" 
                value={columns} 
                onChange={(e) => setColumns(e.target.value)}
              />
              <div className="controls">
                <button 
                  onClick={() => setColumns(Math.max(1, parseInt(columns) - 1))}
                  disabled={parseInt(columns) <= 1}
                >
                  -
                </button>
                <button 
                  onClick={() => setColumns(Math.min(100, parseInt(columns) + 1))}
                  disabled={parseInt(columns) >= 100}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="rows">Number of Rows:</label>
            <div className="input-with-controls">
              <input 
                type="number" 
                id="rows" 
                min="1" 
                max="1000" 
                value={rows} 
                onChange={(e) => setRows(e.target.value)}
              />
              <div className="controls">
                <button 
                  onClick={() => setRows(Math.max(1, parseInt(rows) - 1))}
                  disabled={parseInt(rows) <= 1}
                >
                  -
                </button>
                <button 
                  onClick={() => setRows(Math.min(1000, parseInt(rows) + 1))}
                  disabled={parseInt(rows) >= 1000}
                >
                  +
                </button>
              </div>
            </div>
          </div>
          
          <div className="form-action">
            <button className="apply-btn" onClick={handleApplyGridSettings}>
              <FaColumns /> Apply Grid Settings
            </button>
          </div>
        </div>
        
        <div className="settings-section">
          <h4>Debug Information</h4>
          <div className="debug-box">
            <pre>{getProjectInfo()}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;