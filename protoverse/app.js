import { collection, addDoc, serverTimestamp, query, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// SAVE NEW RECORD
export async function saveManualRecord(db, name, file, material) {
    try {
        await addDoc(collection(db, "Requests"), {
            userName: name,
            fileName: file,
            material: material,
            status: "PENDING",
            timestamp: serverTimestamp()
        });
        return true;
    } catch (e) {
        return false;
    }
}

// LIVE LOAD DATA
export function loadManageRequests(db) {
    const q = query(collection(db, "Requests"), orderBy("timestamp", "desc"));

    onSnapshot(q, (snapshot) => {
        const tableBody = document.getElementById('requestTableBody');
        tableBody.innerHTML = "";
        
        let pending = 0;
        let printing = 0;

        snapshot.forEach((doc) => {
            const data = doc.data();
            if(data.status === "PENDING") pending++;
            if(data.status === "PRINTING") printing++;

            tableBody.innerHTML += `
                <tr class="border-b border-slate-50 hover:bg-slate-50 transition">
                    <td class="py-6">
                        <p class="font-bold text-slate-800">${data.userName}</p>
                        <p class="text-xs text-slate-400">${data.fileName}</p>
                    </td>
                    <td class="py-6 text-slate-600">${data.material}</td>
                    <td class="py-6">
                        <span class="px-3 py-1 rounded-full text-[10px] font-bold ${data.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}">
                            ${data.status}
                        </span>
                    </td>
                    <td class="py-6 text-right">
                        <button class="text-blue-600 font-bold text-sm hover:underline">Manage</button>
                    </td>
                </tr>`;
        });

        // Update UI Counters
        document.getElementById('countPending').innerText = pending;
        document.getElementById('countPrinting').innerText = printing;
        document.getElementById('countToday').innerText = `${snapshot.size} Tasks`;
    });

    
}