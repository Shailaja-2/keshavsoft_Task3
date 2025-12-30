const DATA_PATH = '/data';
let allCourses = [];

const formatCurrency = amount => `₹${amount.toLocaleString('en-IN')}`;
const formatDate = dateStr => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// Load Stats
async function loadStats() {
  try {
    const { stats } = await (await fetch(`${DATA_PATH}/courses.json`)).json();
    document.getElementById('totalCourses').textContent = stats.totalCourses;
    document.getElementById('activeStudents').textContent = stats.activeStudents.toLocaleString();
    document.getElementById('avgRating').textContent = stats.avgRating.toFixed(1);
    document.getElementById('totalRevenue').textContent = formatCurrency(stats.totalRevenue);
  } catch (err) {
    console.error('Failed to load stats', err);
  }
}

// Load Courses
async function loadCourses() {
  try {
    const { courses } = await (await fetch(`${DATA_PATH}/courses.json`)).json();
    allCourses = courses.filter(c => c.status === 'active');
    renderCourses(allCourses);
  } catch (err) {
    console.error('Failed to load courses', err);
    document.getElementById('coursesList').innerHTML = `<div class="col-12 text-center text-danger">Failed to load courses</div>`;
  }
}

// Render Courses
function renderCourses(courses) {
  const container = document.getElementById('coursesList');
  if (!courses.length) {
    container.innerHTML = `<div class="col-12 text-center text-muted">No courses found</div>`;
    return;
  }

  container.innerHTML = courses.map(c => `
    <div class="col-md-6 col-lg-4 mb-3">
      <div class="card h-100">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge bg-primary">${c.level}</span>
            <small class="text-muted">⭐ ${c.rating}</small>
          </div>
          <h5 class="card-title">${c.title}</h5>
          <p class="text-muted mb-2"><small>by ${c.instructor}</small></p>
          <div class="mb-3">
            <small class="text-muted">Progress</small>
            <div class="progress" style="height: 8px;">
              <div class="progress-bar ${c.completion > 70 ? 'bg-success' : c.completion > 40 ? 'bg-warning' : 'bg-info'}"
                   style="width:${c.completion}%"></div>
            </div>
            <small class="text-muted">${c.completion}% complete</small>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <small class="text-muted">${c.enrolled}/${c.capacity} enrolled</small>
            <strong class="text-primary">${formatCurrency(c.price)}</strong>
          </div>
        </div>
        <div class="card-footer bg-light">
          <small class="text-muted"><i class="bi bi-clock"></i> ${c.duration} • <i class="bi bi-calendar"></i> ${formatDate(c.startDate)}</small>
        </div>
      </div>
    </div>
  `).join('');
}

// Filter & Search
function filterCourses() {
  const search = document.getElementById('courseSearch').value.toLowerCase();
  const category = document.getElementById('categoryFilter').value;
  const filtered = allCourses.filter(c =>
    (c.title.toLowerCase().includes(search) || c.instructor.toLowerCase().includes(search)) &&
    (category === 'all' || c.category === category)
  );
  renderCourses(filtered);
}

// Load Enrollments
async function loadEnrollments() {
  try {
    const { recentEnrollments } = await (await fetch(`${DATA_PATH}/students.json`)).json();
    const tbody = document.getElementById('enrollmentsTable');

    if (!recentEnrollments.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No enrollments yet</td></tr>`;
      return;
    }

    tbody.innerHTML = recentEnrollments.map(e => `
      <tr>
        <td>
          <div class="d-flex align-items-center">
            <div class="avatar avatar-md bg-primary me-3">
              <span class="avatar-content">${e.studentName.charAt(0)}</span>
            </div>
            <div>
              <h6 class="mb-0">${e.studentName}</h6>
              <small class="text-muted">${e.email}</small>
            </div>
          </div>
        </td>
        <td>${e.course}</td>
        <td>${formatDate(e.enrolledDate)}</td>
        <td>
          <div class="progress" style="height: 6px; min-width: 100px;">
            <div class="progress-bar" style="width: ${e.progress}%"></div>
          </div>
          <small>${e.progress}%</small>
        </td>
        <td>
          <span class="badge bg-${e.status === 'active' ? 'success' : 'warning'}">${e.status}</span>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load enrollments', err);
  }
}

// Initialize
function initDashboard() {
  loadStats();
  loadCourses();
  loadEnrollments();
  document.getElementById('courseSearch')?.addEventListener('input', filterCourses);
  document.getElementById('categoryFilter')?.addEventListener('change', filterCourses);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}
              