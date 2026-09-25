import { db } from "./firebase-config.js";
import {
    collection,
    getDocs,
    orderBy,
    query
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const responsesList = document.getElementById("responses-list");

async function loadResponses() {
    try {
        const q = query(collection(db, "responses"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);

        if (!responsesList) return;

        responsesList.innerHTML = "";

        if (snapshot.empty) {
            responsesList.innerHTML = `
                <tr>
                    <td colspan="2">Todavía no hay respuestas.</td>
                </tr>
            `;
            return;
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            const answer = data.answer || "Sin respuesta";
            const date = data.createdAt?.toDate?.()
                ? new Date(data.createdAt.toDate()).toLocaleString("es-AR")
                : "Sin fecha";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td><span class="badge ${answer === "Sí" ? "yes" : "no"}">${answer}</span></td>
                <td>${date}</td>
            `;

            responsesList.appendChild(row);
        });
    } catch (error) {
        console.error("Error al leer respuestas:", error);
        if (responsesList) {
            responsesList.innerHTML = `
                <tr>
                    <td colspan="2">No se pudieron cargar las respuestas.</td>
                </tr>
            `;
        }
    }
}

loadResponses();
