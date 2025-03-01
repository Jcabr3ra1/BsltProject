package com.BsltProject.Repositorios;

import com.BsltProject.Modelos.Estado;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RepositorioEstado extends MongoRepository<Estado, String> { // 🔹 Cambié Long por String
}
