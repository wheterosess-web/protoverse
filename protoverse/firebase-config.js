<script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

    // Firebase Configuration
    const firebaseConfig = { 
        apiKey: "AIzaSyAUks4-D4govEH5WcC-_wldetHIs-0u3og",
        projectId: "proto-verse-dqp97l",
        // ... copy the rest from your Firebase console
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // SAVE RECORD FUNCTION (CREATE & UPDATE)
    document.getElementById('saveBtn').onclick = async () => {
        const id = document.getElementById('editId').value;
        const studentName = document.getElementById('mUser').value;
        const fileName = document.getElementById('mFile').value;
        const material = document.getElementById('mMaterial').value;

        // Validation
        if (!studentName || !fileName) {
            alert("Please fill in all fields before saving.");
            return;
        }

        const payload = {
            userName: studentName,
            fileName: fileName,
            material: material,
            updatedAt: serverTimestamp()
        };

        try {
            if (id) {
                // UPDATE: Modify existing document
                await updateDoc(doc(db, "Requests", id), payload);
                console.log("Record Updated Successfully");
            } else {
                // CREATE: Add new document
                payload.status = "Pending"; // Default status for new entries
                payload.createdAt = serverTimestamp();
                await addDoc(collection(db, "Requests"), payload);
                console.log("New Record Created Successfully");
            }
            
            toggleModal(false); // Close the pop-up modal
            fetchRequests();    // Refresh the table data
        } catch (error) {
            console.error("Error saving record: ", error);
            alert("Failed to save record. Check console for details.");
        }
    };

    // READ: Fetch and display data in the glass-card table
    async function fetchRequests() {
        const q = query(collection(db, "Requests"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const tableBody = document.getElementById('requestTableBody');
        tableBody.innerHTML = "";
        
        let pending = 0; let active = 0;

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            
            // Update Stats Counters
            if (data.status === "Pending") pending++;
            if (data.status === "In Progress") active++;

            // Inject Row into Table
            tableBody.innerHTML += `
                <tr class="hover:bg-white/20 transition group">
                    <td class="px-8 py-6">
                        <div class="font-bold text-slate-800">${data.userName}</div>
                        <div class="text-[10px] text-slate-400 mt-1">${data.fileName}</div>
                    </td>
                    <td class="px-8 py-6 text-xs text-slate-600">${data.material}</td>
                    <td class="px-8 py-6">
                        <span class="px-3 py-1 rounded-full text-[10px] font-bold ${data.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}">
                            ${data.status.toUpperCase()}
                        </span>
                    </td>
                    <td class="px-8 py-6 text-right space-x-3">
                        <button onclick="editEntry('${id}', '${data.userName}', '${data.fileName}', '${data.material}')" class="text-blue-500 font-bold text-[10px]">EDIT</button>
                        <button onclick="deleteEntry('${id}')" class="text-red-400 font-bold text-[10px]">DELETE</button>
                    </td>
                </tr>`;
        });

        // Update UI Stats
        document.getElementById('statPending').innerText = pending;
        document.getElementById('statActive').innerText = active;
    }

    // DELETE: Remove record from database
    window.deleteEntry = async (id) => {
        if (confirm("Are you sure you want to delete this print request?")) {
            await deleteDoc(doc(db, "Requests", id));
            fetchRequests();
        }
    };

    // MODAL UI CONTROL
    window.toggleModal = (show) => {
        const modal = document.getElementById('crudModal');
        modal.classList.toggle('hidden', !show);
        if (!show) {
            // Reset fields on close
            document.getElementById('editId').value = "";
            document.getElementById('mUser').value = "";
            document.getElementById('mFile').value = "";
            document.getElementById('modalTitle').innerText = "New Request Entry";
        }
    };

    // Pre-fill modal for Editing
    window.editEntry = (id, user, file, mat) => {
        document.getElementById('editId').value = id;
        document.getElementById('mUser').value = user;
        document.getElementById('mFile').value = file;
        document.getElementById('mMaterial').value = mat;
        document.getElementById('modalTitle').innerText = "Edit Job Details";
        toggleModal(true);
    };

    // Initial Load
    window.onload = fetchRequests;
</script>