import '../dashboard/DashboardPage.css';

export default function DashboardPage() {
  return (
    <div>
    <section>
      <h1>Dashboard</h1>
      
    </section>
    

         {/* Stats Cards */}
        <div className='card-container'>
          
          {[
            { title: "Total Tournaments", value: 12},
            { title: "Total Teams", value: 64 },
            { title: "Total Players", value: 512 },
            { title: "Total Matches", value: 47 },
            { title: "Under Review", value: 12 },
            { title: "Videos Generated", value: 31 },
          ].map((item, index) => (
            <div key={index} className='card'>
              <h4>{item.title}</h4>
              <h2>{item.value}</h2>
            </div>
          ))}

        </div>

        {/* Quick Actions */}
        <h2>Quick Actions</h2>
        <div className='button-group'>
          <button className="button blue">Create Tournament</button>
          <button className="button green">Add Team</button>
          <button className="button purple">Add Player</button>
          <button className="button orange">Create Match</button>
          <button className="button blue">Upload & Review</button>
          <button className="button green">View Reports</button>

        </div>

        <div className='table-box'>
        {/* Recent Matches */}
        <div className='table1'>
        <h2>Recent Matches</h2>
        <p>Latest matches and upcoming fixtures</p>
        
        <table>
          <thead>
            <tr>
              <th>MATCH ID</th>
              <th>TOURNAMENT</th>
              <th>TEAMS</th>
              <th>SCORE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className='match-id'>VM-2026-001</td>
              <td className='text'>Spring Championship 2026</td>
              <td className='text'>Thunder Strikers vs Ocean Waves</td>
              <td>3-1</td>
              <td className='text2'>Completed</td>
            </tr>
            <tr>
              <td className='match-id'>VM-2026-002</td>
              <td className='text'>Regional Cup</td>
              <td className='text'>Sky Hawks vs Net Ninjas</td>
              <td>2-3</td>
              <td className='text2'>Completed</td>
            </tr>
            <tr>
              <td className='match-id'>VM-2026-003</td>
              <td className='text'>Spring Championship 2026</td>
              <td className='text'>Beach Blazers vs Court Kings</td>
              <td>3-2</td>
              <td className='text2'>Completed</td>
            </tr>
            <tr>
              <td className='match-id'>VM-2026-004</td>
              <td className='text'>Regional Cup</td>
              <td className='text'>Thunder Strikers vs Sky Hawks</td>
              <td>--</td>
              <td className='text1'>Upcoming</td>
            </tr>
          </tbody>
        </table>
        </div>

        {/* Active Tournaments */}
         <div className='table2'>
        <h2>Active Tournaments</h2>
        
        <p>Current tournament status</p>
        <table>
          <thead>
            <tr>
              <th>Spring Championship</th>
              <th>Ongoing</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className='text'>Feb 01-Mar 06, 2026</th>
            </tr>
            <tr>
              <th className='text'>16 teams</th>
            </tr>
          </tbody>
        </table>
         <table>
          <thead>
            <tr>
              <th>Regional Cup</th>
              <th>Upcoming</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className='text'>Feb 10-Apr 18, 2026</th>
            </tr>
            <tr>
              <th className='text'>8 teams</th>
            </tr>
          </tbody>
        </table>
        <table>
          <thead>
            <tr>
              <th>National Schools League</th>
              <th>Completed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className='text'>Jan 03-Jan 20, 2026</th>
            </tr>
            <tr>
              <th className='text'>12 teams</th>
            </tr>
          </tbody>
        </table>
         <p className='text1'>View All Tournaments</p>
        </div>
        </div>

<div className='table-box'>
         {/* Team Overview */}
         <div className='table3'>
        <h2>Team Overview</h2>
        <table>
          <tbody>
            <tr>
              <th className='text'>Active Teams</th>
              <th>64</th>
            </tr>
            <tr>
              <th className='text'>Registered Players</th>
              <th>512</th>
            </tr>
            <tr>
              <th className='text'>Avg Players/Team</th>
              <th>8</th>
            </tr>
          </tbody>
        </table>
        </div>

        {/* Upload Activity */}
         <div className='table4'>
        <h2>Upload Activity</h2>
        <table>
          <tbody>
            <tr>
              <th className='text'>Uploaded This Week</th>
              <th>15</th>
            </tr>
            <tr>
              <th className='text'>Processing Now</th>
              <th>3</th>
            </tr>
            <tr>
              <th className='text'>Completed Reviews</th>
              <th>27</th>
            </tr>
          </tbody>
        </table>
        </div>

        {/* Video Generation */}
        <div className='table5'>
        <h2>Video Generation</h2>
        <table>
          <tbody>
            <tr>
              <th className='text'>Ready</th>
              <th>27</th>
            </tr>
            <tr>
              <th className='text'>Generating</th>
              <th>3</th>
            </tr>
            <tr>
              <th className='text'>Failed</th>
              <th>1</th>
            </tr>
          </tbody>
        </table>
        </div>
        </div>
        </div> 
    
  );
}
