// โหลด Firebase SDK แบบ Modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// วาง config ของคุณตรงนี้ (เอามาจาก Firebase Console)
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5aKLjqyxd5JjLJM5aji1lXKweo0_X4UQ",
  authDomain: "bc-community-event-feed-14d86.firebaseapp.com",
  projectId: "bc-community-event-feed-14d86",
  storageBucket: "bc-community-event-feed-14d86.firebasestorage.app",
  messagingSenderId: "462793077843",
  appId: "1:462793077843:web:a533c548b574bfb40242a6",
  measurementId: "G-PZ1YJKEZ2P"
};

// เริ่มต้น Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ตัวแปร UI
const loginSection = document.getElementById('login-section');
const appSection = document.getElementById('app-section');
const btnLoginGoogle = document.getElementById('btn-login-google');
const btnLogout = document.getElementById('btn-logout');
const btnPost = document.getElementById('btn-post');
const postText = document.getElementById('post-text');
const postsContainer = document.getElementById('posts-container');

// 1. ระบบ Login ด้วย Google
btnLoginGoogle.addEventListener('click', () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => console.error(error));
});

// 2. ระบบ Logout
btnLogout.addEventListener('click', () => {
    signOut(auth);
});

// เช็คสถานะว่าล็อกอินอยู่หรือไม่
let currentUser = null;
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loginSection.style.display = 'none';
        appSection.style.display = 'flex';
        loadPosts(); // โหลดฟีดเมื่อล็อกอินสำเร็จ
    } else {
        currentUser = null;
        loginSection.style.display = 'flex';
        appSection.style.display = 'none';
    }
});

// 3. ระบบส่งโพสต์บันทึกลง Firestore
btnPost.addEventListener('click', async () => {
    const text = postText.value;
    if (text.trim() === '') return; // ไม่ให้โพสต์ว่างๆ

    try {
        await addDoc(collection(db, "posts"), {
            text: text,
            authorName: currentUser.displayName,
            authorUid: currentUser.uid,
            createdAt: serverTimestamp()
        });
        postText.value = ''; // เคลียร์ช่องพิมพ์
    } catch (e) {
        console.error("Error adding post: ", e);
    }
});

// 4. ระบบดึงข้อมูลฟีดแบบ Real-time (เสถียรและอัปเดตทันที)
function loadPosts() {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    
    // onSnapshot คือการดึงข้อมูลแบบ Real-time
    onSnapshot(q, (snapshot) => {
        postsContainer.innerHTML = ''; // ล้างของเก่าก่อนแสดงของใหม่
        snapshot.forEach((doc) => {
            const post = doc.data();
            const postElement = document.createElement('div');
            postElement.className = 'post';
            
            // ป้องกัน error กรณี timestamp ยังไม่มา
            const timeString = post.createdAt ? new Date(post.createdAt.toDate()).toLocaleString('th-TH') : 'กำลังโพสต์...';

            postElement.innerHTML = `
                <div class="post-header">
                    ${post.authorName} <span class="post-time">${timeString}</span>
                </div>
                <div class="post-content">
                    <p>${post.text}</p>
                </div>
            `;
            postsContainer.appendChild(postElement);
        });
    });
}
