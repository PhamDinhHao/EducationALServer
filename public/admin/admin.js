// Admin Dashboard JavaScript
const API_BASE_URL = window.location.origin + '/api/v1';
let authToken = localStorage.getItem('adminToken');
let currentUser = null;

// Initialize
$(document).ready(function() {
  setupAjaxDefaults();
  checkAuth();
  setupNavigation();
  setupEventHandlers();
});

// Setup jQuery AJAX defaults to send cookies with all requests
function setupAjaxDefaults() {
  $.ajaxSetup({
    xhrFields: {
      withCredentials: true
    },
    error: function(xhr, status, error) {
      console.error('AJAX Error:', {
        url: this.url,
        status: xhr.status,
        statusText: xhr.statusText,
        response: xhr.responseJSON || xhr.responseText,
        error: error
      });
      
      if (xhr.status === 401) {
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        logout();
      } else if (xhr.status === 403) {
        alert('Bạn không có quyền thực hiện thao tác này.');
      } else if (xhr.status >= 500) {
        alert('Lỗi server: ' + formatErrorMessage(xhr));
      }
    }
  });
}

// Helper function to extract data from API responses
function extractData(response) {
  if (!response) return [];
  
  if (Array.isArray(response)) {
    return response;
  }
  if (response.results) {
    return Array.isArray(response.results) ? response.results : [];
  }
  if (response.data) {
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response.data.results)) {
      return response.data.results;
    }
    if (response.data.users) {
      return Array.isArray(response.data.users) ? response.data.users : [];
    }
    if (response.data.courses) {
      return Array.isArray(response.data.courses) ? response.data.courses : [];
    }
    if (response.data.user) {
      return response.data.user;
    }
  }
  return response;
}

// Helper function to format error messages from API responses
function formatErrorMessage(xhr) {
  const response = xhr.responseJSON || {};
  
  // If there are validation errors (array of errors)
  if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
    // Map field names to Vietnamese
    const fieldNames = {
      email: 'Email',
      password: 'Mật khẩu',
      name: 'Tên',
      role: 'Vai trò',
      title: 'Tiêu đề',
      description: 'Mô tả',
      teacher: 'Giáo viên',
      courseTypeId: 'Loại khóa học',
      courseId: 'Khóa học',
      duration: 'Thời lượng',
      src: 'URL nguồn',
      order: 'Thứ tự'
    };
    
    const errorMessages = response.errors.map(err => {
      const field = err.path || err.field || '';
      const message = err.message || '';
      const fieldName = fieldNames[field] || field;
      
      // Format the message
      let formattedMessage = message;
      if (message.includes('Required')) {
        formattedMessage = 'Trường này là bắt buộc';
      } else if (message.includes('Invalid')) {
        formattedMessage = 'Giá trị không hợp lệ';
      } else if (message.includes('String')) {
        formattedMessage = 'Phải là chuỗi ký tự';
      } else if (message.includes('Number')) {
        formattedMessage = 'Phải là số';
      } else if (message.includes('Email')) {
        formattedMessage = 'Email không hợp lệ';
      }
      
      return fieldName ? `${fieldName}: ${formattedMessage}` : formattedMessage;
    }).join('\n');
    
    return `Lỗi xác thực:\n${errorMessages}`;
  }
  
  // If there's a single message
  if (response.message) {
    // Translate common messages
    if (response.message === 'Validation error') {
      return 'Lỗi xác thực dữ liệu. Vui lòng kiểm tra lại các trường thông tin.';
    }
    return response.message;
  }
  
  // If there's an error field
  if (response.error) {
    return response.error;
  }
  
  // Fallback to status text or default message
  if (xhr.status === 400) {
    return 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
  }
  if (xhr.status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }
  if (xhr.status === 403) {
    return 'Bạn không có quyền thực hiện thao tác này.';
  }
  if (xhr.status === 404) {
    return 'Không tìm thấy tài nguyên.';
  }
  if (xhr.status === 500) {
    return 'Lỗi server. Vui lòng thử lại sau.';
  }
  
  return xhr.statusText || 'Lỗi không xác định';
}

// Authentication
function checkAuth() {
  if (!authToken) {
    $('#loginModal').modal('show');
  } else {
    loadCurrentUser();
  }
}

function handleLogin() {
  const email = $('#loginEmail').val();
  const password = $('#loginPassword').val();
  
  if (!email || !password) {
    alert('Vui lòng nhập đầy đủ email và mật khẩu');
    return;
  }
  
  
  $.ajax({
    url: `${API_BASE_URL}/auth/login`,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ email, password }),
    success: function(response) {
      const responseData = response.data || response;
      const user = responseData.user || responseData;
      
      if (user && user.role === 'ADMIN') {
        localStorage.setItem('adminToken', 'authenticated');
        authToken = 'authenticated';
        currentUser = user;
        $('#loginModal').modal('hide');
        $('#loginEmail').val('');
        $('#loginPassword').val('');
        loadDashboard();
      } else {
        alert('Bạn không có quyền truy cập trang admin. Vui lòng đăng nhập bằng tài khoản ADMIN.');
      }
    },
    error: function(xhr) {
      console.error('Login error:', xhr);
      alert('Đăng nhập thất bại: ' + formatErrorMessage(xhr));
    }
  });
}

function loadCurrentUser() {
  $.ajax({
    url: `${API_BASE_URL}/auth/me`,
    method: 'GET',
    success: function(response) {
      const responseData = response.data || response;
      currentUser = responseData.user || responseData;
      
      if (currentUser && currentUser.role !== 'ADMIN') {
        alert('Bạn không có quyền truy cập trang admin');
        logout();
      } else if (currentUser) {
        if ($('#loginModal').is(':visible')) {
          $('#loginModal').modal('hide');
        }
        loadDashboard();
      }
    },
    error: function(xhr) {
      console.error('Error loading current user:', xhr);
      if (xhr.status === 401) {
        logout();
      }
    }
  });
}

function logout() {
  localStorage.removeItem('adminToken');
  authToken = null;
  currentUser = null;
  $('.content-section').hide();
  $('#dashboard-section').show();
  $('#loginModal').modal('show');
}

function setupEventHandlers() {
  // Logout button
  $('#logoutBtn').click(function(e) {
    e.preventDefault();
    logout();
  });
  
  // Login button
  $('#btnLogin').click(function(e) {
    e.preventDefault();
    handleLogin();
  });
  
  // Login form submit
  $('#loginForm').on('submit', function(e) {
    e.preventDefault();
    handleLogin();
  });
  
  // Enter key on login form
  $('#loginPassword').on('keypress', function(e) {
    if (e.which === 13) {
      e.preventDefault();
      handleLogin();
    }
  });
  
  // Add buttons
  $('#btnAddUser').click(function(e) {
    e.preventDefault();
    showUserModal();
  });
  
  $('#btnAddCourse').click(function(e) {
    e.preventDefault();
    showCourseModal();
  });
  
  $('#btnAddCourseType').click(function(e) {
    e.preventDefault();
    showCourseTypeModal();
  });
  
  $('#btnAddLesson').click(function(e) {
    e.preventDefault();
    showLessonModal();
  });
  
  // Filter selects
  $('#lessonCourseFilter').on('change', function() {
    loadLessons();
  });
  
  $('#commentLessonFilter').on('change', function() {
    loadComments();
  });
  
  $('#progressUserFilter').on('change', function() {
    loadProgressData($(this).val());
  });
  
  // Use event delegation for dynamically created buttons in tables
  $(document).on('click', '.btn-edit-user', function() {
    const id = parseInt($(this).data('id'), 10);
    editUser(id);
  });
  
  $(document).on('click', '.btn-delete-user', function() {
    const id = parseInt($(this).data('id'), 10);
    deleteUser(id);
  });
  
  $(document).on('click', '.btn-edit-course', function() {
    const id = parseInt($(this).data('id'), 10);
    editCourse(id);
  });
  
  $(document).on('click', '.btn-delete-course', function() {
    const id = parseInt($(this).data('id'), 10);
    deleteCourse(id);
  });
  
  $(document).on('click', '.btn-edit-course-type', function() {
    const id = parseInt($(this).data('id'), 10);
    editCourseType(id);
  });
  
  $(document).on('click', '.btn-delete-course-type', function() {
    const id = parseInt($(this).data('id'), 10);
    deleteCourseType(id);
  });
  
  $(document).on('click', '.btn-edit-lesson', function() {
    const id = parseInt($(this).data('id'), 10);
    editLesson(id);
  });
  
  $(document).on('click', '.btn-delete-lesson', function() {
    const id = parseInt($(this).data('id'), 10);
    deleteLesson(id);
  });
  
  $(document).on('click', '.btn-delete-enrollment', function() {
    const id = parseInt($(this).data('id'), 10);
    const userId = parseInt($(this).data('user-id'), 10);
    const courseId = parseInt($(this).data('course-id'), 10);
    deleteEnrollment(id, userId, courseId);
  });
  
  $(document).on('click', '.btn-delete-comment', function() {
    const id = $(this).data('id');
    deleteComment(id);
  });
  
  $(document).on('click', '.btn-view-progress', function() {
    const id = $(this).data('id');
    viewProgressDetail(id);
  });
  
  $(document).on('click', '.btn-delete-asset', function() {
    const id = $(this).data('id');
    deleteAsset(id);
  });
  
  $(document).on('click', '.btn-view-sentence', function() {
    const id = $(this).data('id');
    viewSentence(id);
  });
  
  $(document).on('click', '.btn-delete-sentence', function() {
    const id = $(this).data('id');
    deleteSentence(id);
  });
}

// Navigation
function setupNavigation() {
  $('.nav-link[data-section]').click(function(e) {
    e.preventDefault();
    const section = $(this).data('section');
    showSection(section);
    $('.nav-link').removeClass('active');
    $(this).addClass('active');
  });
  
  $('.small-box-footer[data-section]').click(function(e) {
    e.preventDefault();
    const section = $(this).data('section');
    showSection(section);
    $('.nav-link').removeClass('active');
    $(`.nav-link[data-section="${section}"]`).addClass('active');
  });
}

function showSection(section) {
  $('.content-section').hide();
  const sectionId = `#${section}-section`;
  $(sectionId).show();
  
  const titles = {
    dashboard: 'Dashboard',
    users: 'Quản lý Người dùng',
    courses: 'Quản lý Khóa học',
    'course-types': 'Quản lý Loại Khóa học',
    lessons: 'Quản lý Bài học',
    enrollments: 'Quản lý Đăng ký',
    comments: 'Quản lý Bình luận',
    progress: 'Quản lý Tiến độ',
    assets: 'Quản lý Tài nguyên',
    sentences: 'Quản lý Câu'
  };
  $('#pageTitle').text(titles[section] || 'Admin');
  
  // Load data for the section
  setTimeout(() => {
    if (section === 'dashboard') {
      loadDashboard();
    } else if (section === 'users') {
      loadUsers();
    } else if (section === 'courses') {
      loadCourses();
    } else if (section === 'course-types') {
      loadCourseTypes();
    } else if (section === 'lessons') {
      loadLessons();
    } else if (section === 'enrollments') {
      loadEnrollments();
    } else if (section === 'comments') {
      loadComments();
    } else if (section === 'progress') {
      loadProgress();
    } else if (section === 'assets') {
      loadAssets();
    } else if (section === 'sentences') {
      loadSentences();
    }
  }, 100);
}

// Dashboard
function loadDashboard() {
  Promise.all([
    loadUsers(true),
    loadCourses(true),
    loadEnrollments(true),
    loadComments(true)
  ]).then(() => {
  }).catch(error => {
    console.error('Error loading dashboard:', error);
  });
}

// Users Management
function loadUsers(updateStats = false) {
  return $.ajax({
    url: `${API_BASE_URL}/users`,
    method: 'GET',
    success: function(response) {
      const users = extractData(response);
      const usersArray = Array.isArray(users) ? users : [];
      
      if (updateStats) {
        $('#stat-users').text(usersArray.length);
      } else {
        renderUsersTable(usersArray);
      }
    },
    error: function(xhr) {
      console.error('Error loading users:', xhr);
      if (!updateStats) {
        $('#usersTableBody').html('<tr><td colspan="7" class="text-center text-danger">Lỗi tải dữ liệu: ' + (xhr.responseJSON?.message || 'Không thể tải dữ liệu') + '</td></tr>');
      }
    }
  });
}

function renderUsersTable(users) {
  const tbody = $('#usersTableBody');
  tbody.empty();
  
  if (users.length === 0) {
    tbody.append('<tr><td colspan="7" class="text-center">Không có dữ liệu</td></tr>');
    return;
  }
  
  users.forEach(user => {
    const row = `
      <tr>
        <td>${user.id}</td>
        <td>${user.email}</td>
        <td>${user.name || '-'}</td>
        <td><span class="badge badge-${user.role === 'ADMIN' ? 'danger' : 'primary'}">${user.role}</span></td>
        <td><span class="badge badge-${user.isEmailVerified ? 'success' : 'warning'}">${user.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}</span></td>
        <td>${formatDate(user.createdAt)}</td>
        <td>
          <button class="btn btn-sm btn-info btn-edit-user" data-id="${user.id}" title="Chỉnh sửa"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger btn-delete-user" data-id="${user.id}" title="Xóa"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
    tbody.append(row);
  });
}

function showUserModal(userId = null) {
  const modalHtml = `
    <div class="modal fade" id="userModal" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${userId ? 'Chỉnh sửa' : 'Thêm mới'} Người dùng</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form id="userForm">
              <input type="hidden" id="userId" value="${userId || ''}">
              <div class="form-group">
                <label>Email *</label>
                <input type="email" class="form-control" id="userEmail" required>
              </div>
              <div class="form-group">
                <label>Tên</label>
                <input type="text" class="form-control" id="userName">
              </div>
              <div class="form-group">
                <label>Mật khẩu ${userId ? '(để trống nếu không đổi)' : '*'}</label>
                <input type="password" class="form-control" id="userPassword" ${userId ? '' : 'required'}>
              </div>
              <div class="form-group">
                <label>Vai trò</label>
                <select class="form-control" id="userRole">
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div class="form-group">
                <label>Email đã xác thực</label>
                <select class="form-control" id="userIsEmailVerified">
                  <option value="false">Chưa xác thực</option>
                  <option value="true">Đã xác thực</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-primary" id="btnSaveUser">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  `;
  $('#modalContainer').html(modalHtml);
  $('#userModal').modal('show');
  
  // Bind save button event
  $('#btnSaveUser').off('click').on('click', function() {
    saveUser();
  });
  
  if (userId) {
    $.ajax({
      url: `${API_BASE_URL}/users/${userId}`,
      method: 'GET',
      success: function(response) {
        const user = extractData(response);
        $('#userEmail').val(user.email);
        $('#userName').val(user.name || '');
        $('#userRole').val(user.role);
        $('#userIsEmailVerified').val(user.isEmailVerified ? 'true' : 'false');
      },
      error: function(xhr) {
        alert('Lỗi tải thông tin người dùng: ' + formatErrorMessage(xhr));
      }
    });
  }
}

function saveUser() {
  const userId = $('#userId').val();
  const data = {
    email: $('#userEmail').val(),
    name: $('#userName').val() || null,
    role: $('#userRole').val(),
    isEmailVerified: $('#userIsEmailVerified').val() === 'true'
  };
  
  const password = $('#userPassword').val();
  if (password) {
    data.password = password;
  }
  
  const url = userId ? `${API_BASE_URL}/users/${userId}` : `${API_BASE_URL}/users`;
  const method = userId ? 'PATCH' : 'POST';
  
  $.ajax({
    url: url,
    method: method,
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: function(response) {
      $('#userModal').modal('hide');
      loadUsers();
      alert('Lưu thành công!');
    },
    error: function(xhr) {
      alert(formatErrorMessage(xhr));
    }
  });
}

function editUser(id) {
  showUserModal(id);
}

function deleteUser(id) {
  if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
    $.ajax({
      url: `${API_BASE_URL}/users/${id}`,
      method: 'DELETE',
      success: function() {
        loadUsers();
        alert('Xóa thành công!');
      },
      error: function(xhr) {
        alert(formatErrorMessage(xhr));
      }
    });
  }
}

// Courses Management
function loadCourses(updateStats = false) {
  return $.ajax({
    url: `${API_BASE_URL}/courses`,
    method: 'GET',
    success: function(response) {
      const courses = extractData(response);
      const coursesArray = Array.isArray(courses) ? courses : [];
      
      if (updateStats) {
        $('#stat-courses').text(coursesArray.length);
      } else {
        renderCoursesTable(coursesArray);
      }
    },
    error: function(xhr) {
      console.error('Error loading courses:', xhr);
      if (!updateStats) {
        $('#coursesTableBody').html('<tr><td colspan="7" class="text-center text-danger">Lỗi tải dữ liệu: ' + (xhr.responseJSON?.message || 'Không thể tải dữ liệu') + '</td></tr>');
      }
    }
  });
}

function renderCoursesTable(courses) {
  const tbody = $('#coursesTableBody');
  tbody.empty();
  
  if (courses.length === 0) {
    tbody.append('<tr><td colspan="7" class="text-center">Không có dữ liệu</td></tr>');
    return;
  }
  
  courses.forEach(course => {
    const row = `
      <tr>
        <td>${course.id}</td>
        <td>${course.title}</td>
        <td>${course.teacher || '-'}</td>
        <td>${course.students || 0}</td>
        <td>${course.courseType?.name || course.courseTypeId || '-'}</td>
        <td>${formatDate(course.createdAt)}</td>
        <td>
          <button class="btn btn-sm btn-info btn-edit-course" data-id="${course.id}" title="Chỉnh sửa"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger btn-delete-course" data-id="${course.id}" title="Xóa"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
    tbody.append(row);
  });
}

function showCourseModal(courseId = null) {
  // Load course types first
  $.ajax({
    url: `${API_BASE_URL}/course-types`,
    method: 'GET',
    success: function(response) {
      const types = extractData(response);
      const typesArray = Array.isArray(types) ? types : [];
      
      const optionsHtml = typesArray.map(type => 
        `<option value="${type.id}">${type.name}</option>`
      ).join('');
      
      const modalHtml = `
        <div class="modal fade" id="courseModal" tabindex="-1" role="dialog">
          <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">${courseId ? 'Chỉnh sửa' : 'Thêm mới'} Khóa học</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <form id="courseForm">
                  <input type="hidden" id="courseId" value="${courseId || ''}">
                  <div class="form-group">
                    <label>Tiêu đề *</label>
                    <input type="text" class="form-control" id="courseTitle" required>
                  </div>
                  <div class="form-group">
                    <label>Mô tả</label>
                    <textarea class="form-control" id="courseDescription" rows="3"></textarea>
                  </div>
                  <div class="form-group">
                    <label>Giáo viên</label>
                    <input type="text" class="form-control" id="courseTeacher">
                  </div>
                  <div class="form-group">
                    <label>Hình ảnh</label>
                    <div class="mb-2">
                      <input type="file" class="form-control-file" id="courseImgFile" accept="image/*" style="display: none;">
                      <button type="button" class="btn btn-sm btn-primary" id="btnUploadImage">
                        <i class="fa fa-upload"></i> Upload ảnh
                      </button>
                      <span class="ml-2 text-muted">hoặc</span>
                      <button type="button" class="btn btn-sm btn-secondary ml-2" id="btnUseUrl">
                        Nhập URL
                      </button>
                    </div>
                    <div id="imagePreviewContainer" class="mb-2" style="display: none;">
                      <img id="imagePreview" src="" alt="Preview" style="max-width: 200px; max-height: 200px; border: 1px solid #ddd; border-radius: 4px; padding: 5px;">
                      <button type="button" class="btn btn-sm btn-danger ml-2" id="btnRemoveImage">
                        <i class="fa fa-times"></i> Xóa
                      </button>
                    </div>
                    <input type="text" class="form-control" id="courseImg" placeholder="URL ảnh hoặc upload ảnh phía trên">
                    <small class="form-text text-muted">Upload ảnh hoặc nhập URL ảnh (tối đa 5MB, định dạng: JPG, PNG, WEBP)</small>
                  </div>
                  <div class="form-group">
                    <label>URL</label>
                    <input type="text" class="form-control" id="courseUrl">
                  </div>
                  <div class="form-group">
                    <label>Thời lượng</label>
                    <input type="text" class="form-control" id="courseDuration">
                  </div>
                  <div class="form-group">
                    <label>Loại khóa học *</label>
                    <select class="form-control" id="courseTypeId" required>
                      <option value="">Chọn loại khóa học</option>
                      ${optionsHtml}
                    </select>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
                <button type="button" class="btn btn-primary" id="btnSaveCourse">Lưu</button>
              </div>
            </div>
          </div>
        </div>
      `;
      $('#modalContainer').html(modalHtml);
      $('#courseModal').modal('show');
      
      // Bind save button event
      $('#btnSaveCourse').off('click').on('click', function() {
        saveCourse();
      });
      
      // Bind image upload events
      setupCourseImageUpload();
      
      if (courseId) {
        $.ajax({
          url: `${API_BASE_URL}/courses/${courseId}`,
          method: 'GET',
          success: function(courseResponse) {
            const course = extractData(courseResponse);
            $('#courseTitle').val(course.title);
            $('#courseDescription').val(course.description || '');
            $('#courseTeacher').val(course.teacher || '');
            const imgUrl = course.img || '';
            $('#courseImg').val(imgUrl);
            if (imgUrl) {
              $('#imagePreview').attr('src', imgUrl);
              $('#imagePreviewContainer').show();
            }
            $('#courseUrl').val(course.url || '');
            $('#courseDuration').val(course.duration || '');
            $('#courseTypeId').val(course.courseTypeId || course.courseType?.id);
          },
          error: function(xhr) {
            alert('Lỗi tải thông tin khóa học: ' + formatErrorMessage(xhr));
          }
        });
      }
    },
    error: function(xhr) {
      alert('Lỗi tải loại khóa học: ' + formatErrorMessage(xhr));
    }
  });
}

function saveCourse() {
  const courseId = $('#courseId').val();
  const courseTypeId = $('#courseTypeId').val();
  
  if (!courseTypeId) {
    alert('Vui lòng chọn loại khóa học');
    return;
  }
  
  const data = {
    title: $('#courseTitle').val(),
    description: $('#courseDescription').val() || '',
    teacher: $('#courseTeacher').val() || '',
    img: $('#courseImg').val() || null,
    url: $('#courseUrl').val() || null,
    duration: $('#courseDuration').val() || null,
    courseTypeId: parseInt(courseTypeId)
  };
  
  const url = courseId ? `${API_BASE_URL}/courses/${courseId}` : `${API_BASE_URL}/courses`;
  const method = courseId ? 'PUT' : 'POST';
  
  $.ajax({
    url: url,
    method: method,
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: function(response) {
      $('#courseModal').modal('hide');
      loadCourses();
      alert('Lưu thành công!');
    },
    error: function(xhr) {
      alert(formatErrorMessage(xhr));
    }
  });
}

function editCourse(id) {
  showCourseModal(id);
}

function deleteCourse(id) {
  if (confirm('Bạn có chắc chắn muốn xóa khóa học này?')) {
    $.ajax({
      url: `${API_BASE_URL}/courses/${id}`,
      method: 'DELETE',
      success: function() {
        loadCourses();
        alert('Xóa thành công!');
      },
      error: function(xhr) {
        alert(formatErrorMessage(xhr));
      }
    });
  }
}

// Setup course image upload functionality
function setupCourseImageUpload() {
  let currentImageUrl = '';
  
  // Upload image button
  $('#btnUploadImage').off('click').on('click', function() {
    $('#courseImgFile').click();
  });
  
  // File input change
  $('#courseImgFile').off('change').on('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh (JPG, PNG, WEBP)');
      return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File ảnh phải nhỏ hơn 5MB');
      return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
      $('#imagePreview').attr('src', e.target.result);
      $('#imagePreviewContainer').show();
    };
    reader.readAsDataURL(file);
    
    // Upload file
    uploadCourseImage(file);
  });
  
  // Use URL button
  $('#btnUseUrl').off('click').on('click', function() {
    $('#courseImg').focus();
    $('#imagePreviewContainer').hide();
    $('#courseImgFile').val('');
  });
  
  // Remove image button
  $('#btnRemoveImage').off('click').on('click', function() {
    $('#courseImg').val('');
    $('#imagePreview').attr('src', '');
    $('#imagePreviewContainer').hide();
    $('#courseImgFile').val('');
    currentImageUrl = '';
  });
  
  // Upload image function
  function uploadCourseImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    $.ajax({
      url: `${API_BASE_URL}/courses/upload-image`,
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(response) {
        const imageUrl = response.data?.url || response.url;
        if (imageUrl) {
          currentImageUrl = imageUrl;
          $('#courseImg').val(imageUrl);
          $('#imagePreview').attr('src', imageUrl);
          $('#imagePreviewContainer').show();
        }
      },
      error: function(xhr) {
        alert('Lỗi upload ảnh: ' + formatErrorMessage(xhr));
        $('#imagePreviewContainer').hide();
        $('#courseImgFile').val('');
      }
    });
  }
}

// Course Types Management
function loadCourseTypes(updateSelect = false) {
  return $.ajax({
    url: `${API_BASE_URL}/course-types`,
    method: 'GET',
    success: function(response) {
      const types = extractData(response);
      const typesArray = Array.isArray(types) ? types : [];
      
      if (!updateSelect) {
        renderCourseTypesTable(typesArray);
      }
    },
    error: function(xhr) {
      console.error('Error loading course types:', xhr);
      if (!updateSelect) {
        $('#courseTypesTableBody').html('<tr><td colspan="5" class="text-center text-danger">Lỗi tải dữ liệu: ' + (xhr.responseJSON?.message || 'Không thể tải dữ liệu') + '</td></tr>');
      }
    }
  });
}

function renderCourseTypesTable(types) {
  const tbody = $('#courseTypesTableBody');
  tbody.empty();
  
  if (types.length === 0) {
    tbody.append('<tr><td colspan="5" class="text-center">Không có dữ liệu</td></tr>');
    return;
  }
  
  types.forEach(type => {
    const row = `
      <tr>
        <td>${type.id}</td>
        <td>${type.name}</td>
        <td>${type.description || '-'}</td>
        <td>${formatDate(type.createdAt)}</td>
        <td>
          <button class="btn btn-sm btn-info btn-edit-course-type" data-id="${type.id}" title="Chỉnh sửa"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger btn-delete-course-type" data-id="${type.id}" title="Xóa"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
    tbody.append(row);
  });
}

function showCourseTypeModal(typeId = null) {
  const modalHtml = `
    <div class="modal fade" id="courseTypeModal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${typeId ? 'Chỉnh sửa' : 'Thêm mới'} Loại Khóa học</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <form id="courseTypeForm">
              <input type="hidden" id="courseTypeId" value="${typeId || ''}">
              <div class="form-group">
                <label>Tên *</label>
                <input type="text" class="form-control" id="courseTypeName" required>
              </div>
              <div class="form-group">
                <label>Mô tả</label>
                <textarea class="form-control" id="courseTypeDescription" rows="3"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-primary" id="btnSaveCourseType">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  `;
  $('#modalContainer').html(modalHtml);
  $('#courseTypeModal').modal('show');
  
  // Bind save button event
  $('#btnSaveCourseType').off('click').on('click', function() {
    saveCourseType();
  });
  
  if (typeId) {
    $.ajax({
      url: `${API_BASE_URL}/course-types/${typeId}`,
      method: 'GET',
      success: function(response) {
        const type = extractData(response);
        $('#courseTypeName').val(type.name);
        $('#courseTypeDescription').val(type.description || '');
      },
      error: function(xhr) {
        alert('Lỗi tải thông tin loại khóa học: ' + formatErrorMessage(xhr));
      }
    });
  }
}

function saveCourseType() {
  const typeId = $('#courseTypeId').val();
  const data = {
    name: $('#courseTypeName').val(),
    description: $('#courseTypeDescription').val() || null
  };
  
  const url = typeId ? `${API_BASE_URL}/course-types/${typeId}` : `${API_BASE_URL}/course-types`;
  const method = typeId ? 'PUT' : 'POST';
  
  $.ajax({
    url: url,
    method: method,
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: function(response) {
      $('#courseTypeModal').modal('hide');
      loadCourseTypes();
      alert('Lưu thành công!');
    },
    error: function(xhr) {
      alert(formatErrorMessage(xhr));
    }
  });
}

function editCourseType(id) {
  showCourseTypeModal(id);
}

function deleteCourseType(id) {
  if (confirm('Bạn có chắc chắn muốn xóa loại khóa học này?')) {
    $.ajax({
      url: `${API_BASE_URL}/course-types/${id}`,
      method: 'DELETE',
      success: function() {
        loadCourseTypes();
        alert('Xóa thành công!');
      },
      error: function(xhr) {
        alert(formatErrorMessage(xhr));
      }
    });
  }
}

// Lessons Management
function loadLessons() {
  const courseId = $('#lessonCourseFilter').val();
  let url = `${API_BASE_URL}/lessons`;
  if (courseId) {
    url = `${API_BASE_URL}/lessons/course/${courseId}`;
  }
  
  $.ajax({
    url: url,
    method: 'GET',
    success: function(response) {
      const lessons = extractData(response);
      const lessonsArray = Array.isArray(lessons) ? lessons : [];
      renderLessonsTable(lessonsArray);
      
      // Load courses for filter
      if ($('#lessonCourseFilter option').length <= 1) {
        $.ajax({
          url: `${API_BASE_URL}/courses`,
          method: 'GET',
          success: function(coursesResponse) {
            const courses = extractData(coursesResponse);
            const coursesArray = Array.isArray(courses) ? courses : [];
            const select = $('#lessonCourseFilter');
            select.empty().append('<option value="">Tất cả</option>');
            coursesArray.forEach(course => {
              select.append(`<option value="${course.id}">${course.title}</option>`);
            });
          }
        });
      }
    },
    error: function(xhr) {
      console.error('Error loading lessons:', xhr);
      $('#lessonsTableBody').html('<tr><td colspan="7" class="text-center text-danger">Lỗi tải dữ liệu: ' + formatErrorMessage(xhr) + '</td></tr>');
    }
  });
}

function renderLessonsTable(lessons) {
  const tbody = $('#lessonsTableBody');
  tbody.empty();
  
  if (lessons.length === 0) {
    tbody.append('<tr><td colspan="7" class="text-center">Không có dữ liệu</td></tr>');
    return;
  }
  
  lessons.forEach(lesson => {
    const row = `
      <tr>
        <td>${lesson.id}</td>
        <td>${lesson.title}</td>
        <td>${lesson.course?.title || lesson.courseId || '-'}</td>
        <td>${lesson.duration || '-'}</td>
        <td>${lesson.order || '-'}</td>
        <td>${formatDate(lesson.createdAt)}</td>
        <td>
          <button class="btn btn-sm btn-info btn-edit-lesson" data-id="${lesson.id}" title="Chỉnh sửa"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger btn-delete-lesson" data-id="${lesson.id}" title="Xóa"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
    tbody.append(row);
  });
}

function showLessonModal(lessonId = null) {
  $.ajax({
    url: `${API_BASE_URL}/courses`,
    method: 'GET',
    success: function(response) {
      const courses = extractData(response);
      const coursesArray = Array.isArray(courses) ? courses : [];
      
      const optionsHtml = coursesArray.map(course => 
        `<option value="${course.id}">${course.title}</option>`
      ).join('');
      
      const modalHtml = `
        <div class="modal fade" id="lessonModal" tabindex="-1" role="dialog">
          <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">${lessonId ? 'Chỉnh sửa' : 'Thêm mới'} Bài học</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <form id="lessonForm">
                  <input type="hidden" id="lessonId" value="${lessonId || ''}">
                  <div class="form-group">
                    <label>Tiêu đề *</label>
                    <input type="text" class="form-control" id="lessonTitle" required>
                  </div>
                  <div class="form-group">
                    <label>Mô tả</label>
                    <textarea class="form-control" id="lessonDescription" rows="3"></textarea>
                  </div>
                  <div class="form-group">
                    <label>Thời lượng (phút) *</label>
                    <input type="number" class="form-control" id="lessonDuration" required>
                  </div>
                  <div class="form-group">
                    <label>URL nguồn *</label>
                    <input type="text" class="form-control" id="lessonSrc" required>
                  </div>
                  <div class="form-group">
                    <label>Thứ tự</label>
                    <input type="number" class="form-control" id="lessonOrder" value="0">
                  </div>
                  <div class="form-group">
                    <label>Khóa học *</label>
                    <select class="form-control" id="lessonCourseId" required>
                      <option value="">Chọn khóa học</option>
                      ${optionsHtml}
                    </select>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-dismiss="modal">Đóng</button>
                <button type="button" class="btn btn-primary" id="btnSaveLesson">Lưu</button>
              </div>
            </div>
          </div>
        </div>
      `;
      $('#modalContainer').html(modalHtml);
      $('#lessonModal').modal('show');
      
      // Bind save button event
      $('#btnSaveLesson').off('click').on('click', function() {
        saveLesson();
      });
      
      if (lessonId) {
        $.ajax({
          url: `${API_BASE_URL}/lessons/${lessonId}`,
          method: 'GET',
          success: function(lessonResponse) {
            const lesson = extractData(lessonResponse);
            $('#lessonTitle').val(lesson.title);
            $('#lessonDescription').val(lesson.description || '');
            $('#lessonDuration').val(lesson.duration);
            $('#lessonSrc').val(lesson.src);
            $('#lessonOrder').val(lesson.order || 0);
            $('#lessonCourseId').val(lesson.courseId || lesson.course?.id);
          },
          error: function(xhr) {
            alert('Lỗi tải thông tin bài học: ' + formatErrorMessage(xhr));
          }
        });
      }
    },
    error: function(xhr) {
      alert('Lỗi tải danh sách khóa học: ' + formatErrorMessage(xhr));
    }
  });
}

function saveLesson() {
  const lessonId = $('#lessonId').val();
  const courseId = $('#lessonCourseId').val();
  
  if (!courseId) {
    alert('Vui lòng chọn khóa học');
    return;
  }
  
  const data = {
    title: $('#lessonTitle').val(),
    description: $('#lessonDescription').val() || '',
    duration: parseInt($('#lessonDuration').val()),
    src: $('#lessonSrc').val(),
    order: parseInt($('#lessonOrder').val() || 0),
    courseId: parseInt(courseId)
  };
  
  const url = lessonId ? `${API_BASE_URL}/lessons/${lessonId}` : `${API_BASE_URL}/lessons`;
  const method = lessonId ? 'PUT' : 'POST';
  
  $.ajax({
    url: url,
    method: method,
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: function(response) {
      $('#lessonModal').modal('hide');
      loadLessons();
      alert('Lưu thành công!');
    },
    error: function(xhr) {
      alert(formatErrorMessage(xhr));
    }
  });
}

function editLesson(id) {
  showLessonModal(id);
}

function deleteLesson(id) {
  if (confirm('Bạn có chắc chắn muốn xóa bài học này?')) {
    $.ajax({
      url: `${API_BASE_URL}/lessons/${id}`,
      method: 'DELETE',
      success: function() {
        loadLessons();
        alert('Xóa thành công!');
      },
      error: function(xhr) {
        alert(formatErrorMessage(xhr));
      }
    });
  }
}

// Enrollments Management
function loadEnrollments(updateStats = false) {
  // Admin endpoint to get all enrollments
  return $.ajax({
    url: `${API_BASE_URL}/enrollments`,
    method: 'GET',
    success: function(response) {
      const enrollments = extractData(response);
      const enrollmentsArray = Array.isArray(enrollments) ? enrollments : [];
      
      if (updateStats) {
        $('#stat-enrollments').text(enrollmentsArray.length);
      } else {
        renderEnrollmentsTable(enrollmentsArray);
      }
    },
    error: function(xhr) {
      console.error('Error loading enrollments:', xhr);
      if (!updateStats) {
        $('#enrollmentsTableBody').html('<tr><td colspan="6" class="text-center text-danger">Lỗi tải dữ liệu: ' + formatErrorMessage(xhr) + '</td></tr>');
      }
    }
  });
}

function renderEnrollmentsTable(enrollments) {
  const tbody = $('#enrollmentsTableBody');
  tbody.empty();
  
  if (enrollments.length === 0) {
    tbody.append('<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>');
    return;
  }
  
  enrollments.forEach(enrollment => {
    const statusBadge = enrollment.status === 'ACTIVE' ? 'success' : 
                       enrollment.status === 'COMPLETED' ? 'primary' : 'secondary';
    const userDisplay = enrollment.user 
      ? `${enrollment.user.email}${enrollment.user.name ? ' (' + enrollment.user.name + ')' : ''}`
      : (enrollment.userId || '-');
    const row = `
      <tr>
        <td>${enrollment.id}</td>
        <td>${userDisplay}</td>
        <td>${enrollment.course?.title || enrollment.courseId || '-'}</td>
        <td><span class="badge badge-${statusBadge}">${enrollment.status || 'ACTIVE'}</span></td>
        <td>${formatDate(enrollment.enrolledAt)}</td>
        <td>
          <button class="btn btn-sm btn-danger btn-delete-enrollment" data-id="${enrollment.id}" data-user-id="${enrollment.userId || enrollment.user?.id}" data-course-id="${enrollment.courseId || enrollment.course?.id}" title="Xóa"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
    tbody.append(row);
  });
}

function deleteEnrollment(id, userId, courseId) {
  if (confirm('Bạn có chắc chắn muốn xóa đăng ký này?')) {
    $.ajax({
      url: `${API_BASE_URL}/enrollments`,
      method: 'DELETE',
      contentType: 'application/json',
      data: JSON.stringify({ userId: userId, courseId: courseId }),
      success: function() {
        loadEnrollments();
        alert('Xóa thành công!');
      },
      error: function(xhr) {
        alert(formatErrorMessage(xhr));
      }
    });
  }
}

// Comments Management
function loadComments(updateStats = false) {
  if (updateStats) {
    return $.ajax({
      url: `${API_BASE_URL}/comment/count`,
      method: 'GET',
      success: function(response) {
        const count = response.count || response.data?.count || 0;
        $('#stat-comments').text(count);
      },
      error: function(xhr) {
        console.error('Error loading comment count:', xhr);
        $('#stat-comments').text('0');
      }
    });
  }
  
  const lessonId = $('#commentLessonFilter').val();
  
  if (!lessonId) {
    $('#commentsTableBody').html('<tr><td colspan="6" class="text-center">Vui lòng chọn bài học để xem bình luận</td></tr>');
    
    if ($('#commentLessonFilter option').length <= 1) {
      loadLessonsForCommentFilter();
    }
    return;
  }
  
  let url = `${API_BASE_URL}/comment/lessons/${lessonId}/comments`;
  
  return $.ajax({
    url: url,
    method: 'GET',
    success: function(response) {
      const comments = extractData(response);
      const commentsArray = Array.isArray(comments) ? comments : [];
      renderCommentsTable(commentsArray);
    },
    error: function(xhr) {
      console.error('Error loading comments:', xhr);
      $('#commentsTableBody').html('<tr><td colspan="6" class="text-center text-danger">Lỗi tải dữ liệu: ' + (xhr.responseJSON?.message || 'Không thể tải dữ liệu') + '</td></tr>');
    }
  });
}

function loadLessonsForCommentFilter() {
  $.ajax({
    url: `${API_BASE_URL}/courses`,
    method: 'GET',
    success: function(coursesResponse) {
      const courses = extractData(coursesResponse);
      const coursesArray = Array.isArray(courses) ? courses : [];
      const select = $('#commentLessonFilter');
      select.empty().append('<option value="">Chọn bài học</option>');
      
      // Load lessons for each course
      let loadedCount = 0;
      coursesArray.forEach(course => {
        $.ajax({
          url: `${API_BASE_URL}/lessons/course/${course.id}`,
          method: 'GET',
          success: function(lessonsResponse) {
            const lessons = extractData(lessonsResponse);
            const lessonsArray = Array.isArray(lessons) ? lessons : [];
            lessonsArray.forEach(lesson => {
              select.append(`<option value="${lesson.id}">${lesson.title} (${course.title})</option>`);
            });
            loadedCount++;
          }
        });
      });
    }
  });
}

function renderCommentsTable(comments) {
  const tbody = $('#commentsTableBody');
  tbody.empty();
  
  if (comments.length === 0) {
    tbody.append('<tr><td colspan="6" class="text-center">Không có bình luận</td></tr>');
    return;
  }
  
  comments.forEach(comment => {
    const content = comment.content || '';
    const preview = content.length > 50 ? content.substring(0, 50) + '...' : content;
    const row = `
      <tr>
        <td>${comment.id}</td>
        <td>${preview}</td>
        <td>${comment.author || '-'}</td>
        <td>${comment.lesson?.title || comment.lessonId || '-'}</td>
        <td>${formatDate(comment.createdAt)}</td>
        <td>
          <button class="btn btn-sm btn-danger btn-delete-comment" data-id="${comment.id}" title="Xóa"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
    tbody.append(row);
  });
}

function deleteComment(id) {
  if (confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
    // Note: API might not have delete endpoint for comments
    alert('Chức năng xóa bình luận cần được triển khai trong API');
  }
}

// Progress Management
function loadProgress() {
  const userId = $('#progressUserFilter').val();
  
  // Load users for filter
  if ($('#progressUserFilter option').length <= 1) {
    $.ajax({
      url: `${API_BASE_URL}/users`,
      method: 'GET',
      success: function(usersResponse) {
        const users = extractData(usersResponse);
        const usersArray = Array.isArray(users) ? users : [];
        const select = $('#progressUserFilter');
        select.empty().append('<option value="">Tất cả</option>');
        usersArray.forEach(user => {
          select.append(`<option value="${user.id}">${user.email}${user.name ? ' (' + user.name + ')' : ''}</option>`);
        });
        // After loading users, load progress
        loadProgressData(userId);
      },
      error: function() {
        // Still try to load progress even if users fail
        loadProgressData(userId);
      }
    });
  } else {
    loadProgressData(userId);
  }
}

function loadProgressData(userId) {
  let url;
  if (userId) {
    url = `${API_BASE_URL}/progress/users/${userId}`;
  } else {
    // Load all progress
    url = `${API_BASE_URL}/progress`;
  }
  
  $.ajax({
    url: url,
    method: 'GET',
    success: function(response) {
      const progress = extractData(response);
      const progressArray = Array.isArray(progress) ? progress : [];
      renderProgressTable(progressArray);
    },
    error: function(xhr) {
      console.error('Error loading progress:', xhr);
      $('#progressTableBody').html('<tr><td colspan="7" class="text-center text-danger">Lỗi tải dữ liệu: ' + (xhr.responseJSON?.message || 'Không thể tải dữ liệu') + '</td></tr>');
    }
  });
}

function renderProgressTable(progress) {
  const tbody = $('#progressTableBody');
  tbody.empty();
  
  if (progress.length === 0) {
    tbody.append('<tr><td colspan="7" class="text-center">Không có dữ liệu</td></tr>');
    return;
  }
  
  progress.forEach(item => {
    const progressPercent = item.progress || 0;
    const lessonTitle = item.lesson?.title || item.lesson?.course?.title || item.lessonId || '-';
    const userEmail = item.user?.email || item.userId || '-';
    const row = `
      <tr>
        <td>${item.id || '-'}</td>
        <td>${userEmail}</td>
        <td>${lessonTitle}</td>
        <td>
          <div class="progress" style="height: 20px;">
            <div class="progress-bar" role="progressbar" style="width: ${progressPercent}%" aria-valuenow="${progressPercent}" aria-valuemin="0" aria-valuemax="100">
              ${progressPercent}%
            </div>
          </div>
        </td>
        <td>${item.completedAt ? formatDate(item.completedAt) : '-'}</td>
        <td>${item.lastViewedAt ? formatDate(item.lastViewedAt) : '-'}</td>
        <td>
          <button class="btn btn-sm btn-info btn-view-progress" data-id="${item.id || item.lessonId}" title="Xem chi tiết"><i class="fas fa-eye"></i></button>
        </td>
      </tr>
    `;
    tbody.append(row);
  });
}

function viewProgressDetail(id) {
  alert('Chi tiết tiến độ: ID ' + id);
}

// Assets Management
function loadAssets() {
  $.ajax({
    url: `${API_BASE_URL}/assets/all`,
    method: 'GET',
    success: function(response) {
      const assets = extractData(response);
      const assetsArray = Array.isArray(assets) ? assets : [];
      renderAssetsTable(assetsArray);
    },
    error: function(xhr) {
      console.error('Error loading assets:', xhr);
      $('#assetsTableBody').html('<tr><td colspan="6" class="text-center text-danger">Lỗi tải dữ liệu: ' + (xhr.responseJSON?.message || 'Không thể tải dữ liệu') + '</td></tr>');
    }
  });
}

function renderAssetsTable(assets) {
  const tbody = $('#assetsTableBody');
  tbody.empty();
  
  if (assets.length === 0) {
    tbody.append('<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>');
    return;
  }
  
  assets.forEach(asset => {
    const src = asset.src || '';
    const srcPreview = src.length > 30 ? src.substring(0, 30) + '...' : src;
    const userEmail = asset.user?.email || asset.userId || '-';
    const row = `
      <tr>
        <td>${asset.id}</td>
        <td>${asset.name}</td>
        <td><span class="badge badge-${asset.type === 'IMAGE' ? 'info' : 'secondary'}">${asset.type || 'IMAGE'}</span></td>
        <td><a href="${src}" target="_blank" title="${src}">${srcPreview}</a></td>
        <td>${userEmail}</td>
        <td>
          <button class="btn btn-sm btn-danger btn-delete-asset" data-id="${asset.id}" title="Xóa"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
    tbody.append(row);
  });
}

function deleteAsset(id) {
  if (confirm('Bạn có chắc chắn muốn xóa tài nguyên này?')) {
    $.ajax({
      url: `${API_BASE_URL}/assets/${id}`,
      method: 'DELETE',
      success: function() {
        loadAssets();
        alert('Xóa thành công!');
      },
      error: function(xhr) {
        alert(formatErrorMessage(xhr));
      }
    });
  }
}

// Sentences Management
function loadSentences() {
  $.ajax({
    url: `${API_BASE_URL}/sentences`,
    method: 'GET',
    success: function(response) {
      // API returns {data: [...], total: number}
      let sentences = [];
      if (response.data) {
        sentences = Array.isArray(response.data) ? response.data : [];
      } else {
        sentences = extractData(response);
        sentences = Array.isArray(sentences) ? sentences : [];
      }
      renderSentencesTable(sentences);
    },
    error: function(xhr) {
      console.error('Error loading sentences:', xhr);
      $('#sentencesTableBody').html('<tr><td colspan="6" class="text-center text-danger">Lỗi tải dữ liệu: ' + (xhr.responseJSON?.message || 'Không thể tải dữ liệu') + '</td></tr>');
    }
  });
}

function renderSentencesTable(sentences) {
  const tbody = $('#sentencesTableBody');
  tbody.empty();
  
  if (sentences.length === 0) {
    tbody.append('<tr><td colspan="6" class="text-center">Không có dữ liệu</td></tr>');
    return;
  }
  
  sentences.forEach(sentence => {
    const content = sentence.content || '';
    const preview = content.length > 50 ? content.substring(0, 50) + '...' : content;
    const row = `
      <tr>
        <td>${sentence.id}</td>
        <td>${sentence.name}</td>
        <td>${preview}</td>
        <td>${sentence.user?.email || sentence.userId || '-'}</td>
        <td>${formatDate(sentence.createdAt)}</td>
        <td>
          <button class="btn btn-sm btn-info btn-view-sentence" data-id="${sentence.id}" title="Xem chi tiết"><i class="fas fa-eye"></i></button>
          <button class="btn btn-sm btn-danger btn-delete-sentence" data-id="${sentence.id}" title="Xóa"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
    tbody.append(row);
  });
}

function viewSentence(id) {
  $.ajax({
    url: `${API_BASE_URL}/sentences/${id}`,
    method: 'GET',
    success: function(response) {
      const sentence = extractData(response);
      alert(`Câu: ${sentence.name}\n\nNội dung:\n${sentence.content}`);
    },
    error: function(xhr) {
      alert('Lỗi tải câu: ' + formatErrorMessage(xhr));
    }
  });
}

function deleteSentence(id) {
  if (confirm('Bạn có chắc chắn muốn xóa câu này?')) {
    $.ajax({
      url: `${API_BASE_URL}/sentences/${id}`,
      method: 'DELETE',
      success: function() {
        loadSentences();
        alert('Xóa thành công!');
      },
      error: function(xhr) {
        alert(formatErrorMessage(xhr));
      }
    });
  }
}

// Utility Functions
function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return dateString;
  }
}

// Modal save functions (called from dynamically created modals)
window.saveUser = saveUser;
window.saveCourse = saveCourse;
window.saveCourseType = saveCourseType;
window.saveLesson = saveLesson;
