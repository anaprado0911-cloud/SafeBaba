package com.safebaba.service;

import com.safebaba.model.Baba;
import com.safebaba.repository.BabaRepository;
import java.text.Normalizer;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;

@Service
public class BabaService {
    private final BabaRepository repo;

    public BabaService(BabaRepository repo) { this.repo = repo; }

    public List<Baba> listar(String cidade) { return listar(cidade, false); }

    public List<Baba> listar(String cidade, boolean somenteDisponiveis) {
        if (cidade == null || cidade.isBlank()) {
            return repo.findAll().stream()
                .filter(b -> !somenteDisponiveis || (Boolean.TRUE.equals(b.getDisponivelAgora()) && Boolean.TRUE.equals(b.getVerificada())))
                .sorted(Comparator.comparing(Baba::getNotaMedia, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
        }
        String filtro = normalizar(cidade.trim());
        // Busca sem diferenciar maiúsculas/minúsculas nem acentos (ex.: Sao Paulo e São Paulo).
        return repo.findAll().stream()
            .filter(b -> !somenteDisponiveis || (Boolean.TRUE.equals(b.getDisponivelAgora()) && Boolean.TRUE.equals(b.getVerificada())))
            .filter(b -> b.getUsuario() != null && b.getUsuario().getCidade() != null
                && (normalizar(b.getUsuario().getCidade()).contains(filtro)
                || filtro.contains(normalizar(b.getUsuario().getCidade()))))
            .sorted(Comparator.comparing(Baba::getNotaMedia, Comparator.nullsLast(Comparator.reverseOrder())))
            .toList();
    }

    private String normalizar(String valor) {
        return Normalizer.normalize(valor, Normalizer.Form.NFD)
            .replaceAll("\\p{M}+", "")
            .toLowerCase(Locale.ROOT);
    }

    public Baba buscarPorEmail(String email) {
        return repo.findAll().stream().filter(b -> b.getUsuario() != null && b.getUsuario().getEmail().equalsIgnoreCase(email))
            .findFirst().orElseThrow(() -> new IllegalArgumentException("Perfil de babá não encontrado para esta conta."));
    }

    public Baba buscar(Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Babá não encontrada."));
    }

    public Baba salvar(Baba b) { return repo.save(b); }
}
