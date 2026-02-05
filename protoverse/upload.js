import { storage, db } from './firebase-config.js';
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function handleFileUpload(file) {
    if (!file) return;

    // 1. Create a storage reference
    const storageRef = ref(storage, `print_files/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    // 2. Track Progress
    uploadTask.on('state_changed', 
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            document.getElementById('uploadProgressText').innerText = `Uploading: ${Math.round(progress)}%`;
        }, 
        (error) => { alert("Upload failed: " + error.message); }, 
        async () => {
            // 3. Get the URL after successful upload
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            // 4. Save metadata to Firestore for the Mobile App
            await addDoc(collection(db, "print_jobs"), {
                fileName: file.name,
                fileUrl: downloadURL,
                status: "pending",
                timestamp: serverTimestamp(),
                category: document.getElementById('categorySelect').value // e.g., GCODE
            });

            alert("File ready for 3D Printing!");
            window.location.href = 'dashboard.html';
        }
    );
}