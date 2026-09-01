const BASE_URL = 'http://127.0.0.1:5000/api';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Error HTTP ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // --- AUTORES ---
  async getAutores() {
    const res = await fetch(`${BASE_URL}/autores/`);
    return handleResponse(res);
  },

  async getAutorById(id) {
    const res = await fetch(`${BASE_URL}/autores/${id}`);
    return handleResponse(res);
  },

  async createAutor(autorData) {
    const res = await fetch(`${BASE_URL}/autores/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(autorData),
    });
    return handleResponse(res);
  },

  async updateAutor(id, autorData) {
    const res = await fetch(`${BASE_URL}/autores/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(autorData),
    });
    return handleResponse(res);
  },

  async deleteAutor(id) {
    const res = await fetch(`${BASE_URL}/autores/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // --- LIBROS ---
  async getLibros(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.autor_id) query.append('autor_id', params.autor_id);
    if (params.disponible !== undefined && params.disponible !== '') {
      query.append('disponible', params.disponible);
    }

    const url = `${BASE_URL}/libros/${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async getLibroById(id) {
    const res = await fetch(`${BASE_URL}/libros/${id}`);
    return handleResponse(res);
  },

  async createLibro(libroData) {
    const res = await fetch(`${BASE_URL}/libros/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(libroData),
    });
    return handleResponse(res);
  },

  async updateLibro(id, libroData) {
    const res = await fetch(`${BASE_URL}/libros/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(libroData),
    });
    return handleResponse(res);
  },

  async deleteLibro(id) {
    const res = await fetch(`${BASE_URL}/libros/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  async importExcel(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${BASE_URL}/libros/import-excel`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse(res);
  },
};

