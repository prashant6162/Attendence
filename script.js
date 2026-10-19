
/* =========================================
   CampusQR - College Attendance System
   Google Form QR Integration
========================================= */

// Your Google Form URL
const GOOGLE_FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSfRhlSxztGnovE_D6jaJ3k0i8VTPAK6pSgwmUlf_p3ZWUMwew/viewform?usp=dialog";

// Demo login credentials
const FACULTY_USERNAME = "Prashant";
const FACULTY_PASSWORD = "faculty123";

const STUDENT_ENROLLMENT = "240101020112";
const STUDENT_PASSWORD = "student123";

// Store current attendance session for this browser
let currentSession = null;
let qrTimer = null;


// =========================================
// 1. LOGIN FUNCTION
// =========================================

function loginUser(event) {
    if (event) event.preventDefault();

    const roleElement = document.getElementById("role");
    const usernameElement = document.getElementById("username");
    const passwordElement = document.getElementById("password");
    const errorElement = document.getElementById("loginError");

    if (!roleElement || !usernameElement || !passwordElement) {
        alert("Login form fields nahi mile. HTML IDs check karo.");
        return false;
    }

    const role = roleElement.value;
    const username = usernameElement.value.trim();
    const password = passwordElement.value;

    let destination = "";

    if (
        role === "faculty" &&
        username === FACULTY_USERNAME &&
        password === FACULTY_PASSWORD
    ) {
        destination = "faculty-dashboard.html";
    } else if (
        role === "student" &&
        username === STUDENT_ENROLLMENT &&
        password === STUDENT_PASSWORD
    ) {
        destination = "student-dashboard.html";
    } else {
        if (errorElement) {
            errorElement.textContent =
                "Invalid credentials. Please check your username and password.";
        } else {
            alert("Invalid username or password.");
        }
        return false;
    }

    sessionStorage.setItem("campusQRRole", role);
    sessionStorage.setItem("campusQRUsername", username);

    window.location.href = destination;
    return false;
}


// =========================================
// 2. GENERATE FACULTY QR CODE
// =========================================

function generateQRCode() {
    const subjectElement = document.getElementById("subject");
    const classElement = document.getElementById("className");
    const lectureElement = document.getElementById("lecture");
    const dateElement = document.getElementById("date");

    const qrPanel = document.getElementById("qrPanel");
    const qrBox = document.getElementById("qrcode");

    if (!qrBox) {
        alert("QR container nahi mila. HTML mein id='qrcode' add karo.");
        return;
    }

    if (typeof QRCode === "undefined") {
        alert("QR library load nahi hui. Internet aur script links check karo.");
        return;
    }

    const subject = subjectElement ? subjectElement.value : "General";
    const className = classElement ? classElement.value : "Class";
    const lecture = lectureElement ? lectureElement.value : "Lecture 1";
    const date = dateElement
        ? dateElement.value
        : new Date().toISOString().slice(0, 10);

    // Stop previous countdown
    if (qrTimer) {
        clearInterval(qrTimer);
    }

    // Generate a new session ID for display/tracking
    currentSession = {
        id: crypto.randomUUID
            ? crypto.randomUUID()
            : Date.now().toString(),
        subject,
        className,
        lecture,
        date,
        expiresAt: Date.now() + 60000
    };

    // Clear previous QR
    qrBox.innerHTML = "";

    // IMPORTANT: This QR opens Google Forms directly.
    new QRCode(qrBox, {
        text: GOOGLE_FORM_URL,
        width: 250,
        height: 250,
        correctLevel: QRCode.CorrectLevel.M
    });

    if (qrPanel) {
        qrPanel.classList.remove("hidden");
    }

    const qrSubject = document.getElementById("qrSubject");
    const qrDetails = document.getElementById("qrDetails");
    const qrStatus = document.getElementById("qrStatus");
    const qrCountdown = document.getElementById("qrCountdown");

    if (qrSubject) qrSubject.textContent = subject;

    if (qrDetails) {
        qrDetails.textContent =
            `${className} | ${lecture} | ${date}`;
    }

    if (qrStatus) {
        qrStatus.textContent = "Active";
    }

    // Countdown display: 60 seconds
    let remainingSeconds = 60;

    if (qrCountdown) {
        qrCountdown.textContent =
            `QR expires in ${remainingSeconds} seconds`;
    }

    qrTimer = setInterval(() => {
        remainingSeconds--;

        if (qrCountdown) {
            qrCountdown.textContent =
                `QR expires in ${Math.max(remainingSeconds, 0)} seconds`;
        }

        if (remainingSeconds <= 0) {
            clearInterval(qrTimer);
            qrTimer = null;

            if (qrStatus) {
                qrStatus.textContent = "Expired";
            }

            if (qrCountdown) {
                qrCountdown.textContent = "Session time ended.";
            }

            // Hide QR after countdown
            qrBox.innerHTML =
                "<p>QR session expired. Generate a new QR.</p>";
        }
    }, 1000);
}


// =========================================
// 3. CLOSE ATTENDANCE SESSION MANUALLY
// =========================================

function closeAttendanceSession() {
    if (qrTimer) {
        clearInterval(qrTimer);
        qrTimer = null;
    }

    const qrBox = document.getElementById("qrcode");
    const qrStatus = document.getElementById("qrStatus");
    const qrCountdown = document.getElementById("qrCountdown");

    currentSession = null;

    if (qrBox) {
        qrBox.innerHTML = "<p>Attendance session closed.</p>";
    }

    if (qrStatus) {
        qrStatus.textContent = "Closed";
    }

    if (qrCountdown) {
        qrCountdown.textContent = "";
    }
}


// =========================================
// 4. OPEN GOOGLE FORM FROM STUDENT DASHBOARD
// =========================================

function openAttendanceForm() {
    window.open(GOOGLE_FORM_URL, "_blank", "noopener");
}


// =========================================
// 5. SHOW CURRENT DATE AND TIME
// =========================================

function updateDateTime() {
    const dateTimeElement = document.getElementById("currentDateTime");

    if (dateTimeElement) {
        dateTimeElement.textContent =
            new Date().toLocaleString();
    }
}


// =========================================
// 6. LOGOUT
// =========================================

function logoutUser() {
    sessionStorage.removeItem("campusQRRole");
    sessionStorage.removeItem("campusQRUsername");

    window.location.href = "index.html";
}


// =========================================
// 7. INITIALIZE PAGE
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    // Login form
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", loginUser);
    }

    // Faculty QR generation button
    const generateButton = document.getElementById("generateQRBtn");

    if (generateButton) {
        generateButton.addEventListener("click", generateQRCode);
    }

    // Manually close the session
    const closeButton = document.getElementById("closeSessionBtn");

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeAttendanceSession
        );
    }

    // Student opens Google Form
    const attendanceButton =
        document.getElementById("openAttendanceFormBtn");

    if (attendanceButton) {
        attendanceButton.addEventListener(
            "click",
            openAttendanceForm
        );
    }

    // Logout buttons
    document.querySelectorAll(".logoutBtn").forEach(button => {
        button.addEventListener("click", logoutUser);
    });

    updateDateTime();
});
