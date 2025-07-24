
let students = [];
let seatingArrangement = Array(30).fill(null);

// 페이지 로드시 초기화
document.addEventListener('DOMContentLoaded', function() {
    createSeatingGrid();
    updateStudentList();
    loadFromStorage();
});

// 자리 그리드 생성 (5행 6열)
function createSeatingGrid() {
    const grid = document.getElementById('seatingGrid');
    grid.innerHTML = '';
    
    for (let i = 1; i <= 30; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        seat.id = `seat-${i}`;
        seat.onclick = () => selectSeat(i);
        
        const seatNumber = document.createElement('div');
        seatNumber.className = 'seat-number';
        seatNumber.textContent = i;
        
        const studentName = document.createElement('div');
        studentName.className = 'student-name';
        
        seat.appendChild(seatNumber);
        seat.appendChild(studentName);
        grid.appendChild(seat);
    }
}

// 학생 추가
function addStudent() {
    const input = document.getElementById('studentName');
    const name = input.value.trim();
    
    if (name === '') {
        alert('학생 이름을 입력해주세요.');
        return;
    }
    
    if (students.includes(name)) {
        alert('이미 등록된 학생입니다.');
        return;
    }
    
    if (students.length >= 30) {
        alert('최대 30명까지만 등록할 수 있습니다.');
        return;
    }
    
    students.push(name);
    input.value = '';
    updateStudentList();
    saveToStorage();
}

// 학생 목록 업데이트
function updateStudentList() {
    const container = document.getElementById('studentListContainer');
    const countElement = document.getElementById('studentCount');
    
    container.innerHTML = '';
    countElement.textContent = students.length;
    
    students.forEach((student, index) => {
        const tag = document.createElement('div');
        tag.className = 'student-tag';
        
        // 자리에 배치되었는지 확인
        const isAssigned = seatingArrangement.includes(student);
        if (isAssigned) {
            tag.classList.add('assigned');
        }
        
        tag.innerHTML = `
            ${student}
            <button class="remove-btn" onclick="removeStudent(${index})">×</button>
        `;
        
        container.appendChild(tag);
    });
}

// 학생 제거
function removeStudent(index) {
    const studentName = students[index];
    
    // 자리에서도 제거
    const seatIndex = seatingArrangement.indexOf(studentName);
    if (seatIndex !== -1) {
        seatingArrangement[seatIndex] = null;
        updateSeatDisplay(seatIndex + 1);
    }
    
    students.splice(index, 1);
    updateStudentList();
    saveToStorage();
}

// 자리 선택
function selectSeat(seatNumber) {
    const seatIndex = seatNumber - 1;
    const currentStudent = seatingArrangement[seatIndex];
    
    if (currentStudent) {
        // 이미 학생이 앉아있으면 제거
        seatingArrangement[seatIndex] = null;
        updateSeatDisplay(seatNumber);
        updateStudentList();
        saveToStorage();
        return;
    }
    
    // 배치되지 않은 학생 목록
    const unassignedStudents = students.filter(student => 
        !seatingArrangement.includes(student)
    );
    
    if (unassignedStudents.length === 0) {
        alert('배치할 학생이 없습니다.');
        return;
    }
    
    // 학생 선택 다이얼로그
    let studentList = '배치할 학생을 선택하세요:\n\n';
    unassignedStudents.forEach((student, index) => {
        studentList += `${index + 1}. ${student}\n`;
    });
    
    const choice = prompt(studentList + '\n번호를 입력하세요:');
    const choiceIndex = parseInt(choice) - 1;
    
    if (choiceIndex >= 0 && choiceIndex < unassignedStudents.length) {
        const selectedStudent = unassignedStudents[choiceIndex];
        seatingArrangement[seatIndex] = selectedStudent;
        updateSeatDisplay(seatNumber);
        updateStudentList();
        saveToStorage();
    }
}

// 자리 표시 업데이트
function updateSeatDisplay(seatNumber) {
    const seat = document.getElementById(`seat-${seatNumber}`);
    const studentName = seat.querySelector('.student-name');
    const student = seatingArrangement[seatNumber - 1];
    
    if (student) {
        seat.classList.add('occupied');
        studentName.textContent = student;
    } else {
        seat.classList.remove('occupied');
        studentName.textContent = '';
    }
}

// 자동 배치
function shuffleSeating() {
    if (students.length === 0) {
        alert('배치할 학생이 없습니다.');
        return;
    }
    
    if (!confirm('현재 배치를 지우고 자동으로 배치하시겠습니까?')) {
        return;
    }
    
    // 기존 배치 초기화
    seatingArrangement.fill(null);
    
    // 학생 목록 복사 및 섞기
    const shuffledStudents = [...students];
    for (let i = shuffledStudents.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledStudents[i], shuffledStudents[j]] = [shuffledStudents[j], shuffledStudents[i]];
    }
    
    // 자리에 배치
    shuffledStudents.forEach((student, index) => {
        if (index < 30) {
            seatingArrangement[index] = student;
        }
    });
    
    // 화면 업데이트
    for (let i = 1; i <= 30; i++) {
        updateSeatDisplay(i);
    }
    
    updateStudentList();
    saveToStorage();
}

// 모든 데이터 지우기
function clearAll() {
    if (!confirm('모든 학생과 자리배치를 지우시겠습니까?')) {
        return;
    }
    
    students = [];
    seatingArrangement.fill(null);
    
    for (let i = 1; i <= 30; i++) {
        updateSeatDisplay(i);
    }
    
    updateStudentList();
    saveToStorage();
}

// 자리만 초기화
function resetSeating() {
    if (!confirm('자리배치만 초기화하시겠습니까? (학생 목록은 유지됩니다)')) {
        return;
    }
    
    seatingArrangement.fill(null);
    
    for (let i = 1; i <= 30; i++) {
        updateSeatDisplay(i);
    }
    
    updateStudentList();
    saveToStorage();
}

// 로컬 스토리지에 저장
function saveToStorage() {
    localStorage.setItem('classroomData', JSON.stringify({
        students: students,
        seatingArrangement: seatingArrangement
    }));
}

// 로컬 스토리지에서 불러오기
function loadFromStorage() {
    const saved = localStorage.getItem('classroomData');
    if (saved) {
        const data = JSON.parse(saved);
        students = data.students || [];
        seatingArrangement = data.seatingArrangement || Array(30).fill(null);
        
        // 화면 업데이트
        for (let i = 1; i <= 30; i++) {
            updateSeatDisplay(i);
        }
        updateStudentList();
    }
}

// 엔터키로 학생 추가
document.getElementById('studentName').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addStudent();
    }
});
