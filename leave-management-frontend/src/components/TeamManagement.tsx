import React, { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import '../css/TeamManagement.css';  // Assuming the CSS file is named "TeamManagement.css"

const TeamManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState<any[]>([]); // Placeholder for team data
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate an API call
    const fetchTeamData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate waiting API call (replace with real API in the future)
        setTimeout(() => {
          setTeamData([
            { id: 1, name: 'Alice', role: 'Developer' },
            { id: 2, name: 'Bob', role: 'Designer' },
            { id: 3, name: 'Charlie', role: 'Product Manager' }
          ]);
          setLoading(false);
        }, 2000); // Simulate 2 seconds delay
      } catch (err) {
        setError('Failed to load team data.');
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  return (
    <div className="team-management-container">
      <div className="header">
        <FaUserCircle size={28} className="icon" />
        <h2>Team Management</h2>
      </div>

      <div className="content">
        {loading ? (
          <div className="loading">Loading team data...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="team-list">
            <ul>
              {teamData.map((member) => (
                <li key={member.id} className="team-member">
                  <span className="name">{member.name}</span>
                  <span className="role">{member.role}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamManagement;
