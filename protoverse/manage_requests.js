<script type="module">
    // ... (Your Firebase Imports/Config stay at the top)

    const handleSave = async () => {
        const saveBtn = document.getElementById('saveBtn');
        const id = document.getElementById('editId').value;
        const name = document.getElementById('mUser').value;
        const file = document.getElementById('mFile').value;
        const mat = document.getElementById('mMaterial').value;

        // Validation
        if (!name || !file) {
            return alert("⚠️ Please fill in all fields!");
        }

        // 1. Visual Loading State
        saveBtn.disabled = true;
        saveBtn.innerText = "Processing...";
        saveBtn.style.opacity = "0.5";

        const payload = { 
            userName: name, 
            fileName: file, 
            material: mat, 
            updatedAt: serverTimestamp() 
        };

        try {
            if (id) {
                // UPDATE existing record
                await updateDoc(doc(db, "Requests", id), payload);
                alert("✅ Record updated successfully!");
            } else {
                // CREATE new record
                payload.status = "Pending";
                payload.createdAt = serverTimestamp();
                await addDoc(collection(db, "Requests"), payload);
                alert("🚀 New request added to the queue!");
            }
            
            // 2. Clean up UI
            closeModal();
            if (typeof fetchRequests === "function") fetchRequests();
            
        } catch (e) { 
            console.error("Firebase Error:", e);
            alert("❌ Save failed: " + e.message);
        } finally {
            // 3. Reset Button
            saveBtn.disabled = false;
            saveBtn.innerText = "Save Record";
            saveBtn.style.opacity = "1";
        }
    };

    // --- THE CRITICAL BRIDGE CODE ---
    // This attaches the code to the button once the page loads
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('saveBtn');
        if (btn) {
            btn.addEventListener('click', handleSave);
            console.log("✅ Connection established: Button is active.");
        }
    });

    // Make functions global so they work with other buttons
    window.handleSave = handleSave;
</script>