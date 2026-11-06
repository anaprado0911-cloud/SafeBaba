
package com.safebaba.controller;

import com.safebaba.model.Baba;
import com.safebaba.model.DocumentoVerificacao;
import com.safebaba.repository.DocumentoVerificacaoRepository;
import com.safebaba.service.BabaService;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/documentos-baba")
public class DocumentoController {

    private final BabaService babaService;
    private final DocumentoVerificacaoRepository repo;

    public DocumentoController(BabaService babaService,
                               DocumentoVerificacaoRepository repo) {
        this.babaService = babaService;
        this.repo = repo;
    }

    @GetMapping("/meu")
    public Map<String, Object> meu(Authentication auth) {

        Baba baba = babaService.buscarPorEmail(auth.getName());
        DocumentoVerificacao d = repo.findByBabaId(baba.getId()).orElse(null);

        if (d == null) {
            return Map.of("enviado", false, "status", "NAO_ENVIADO");
        }

        return Map.of(
            "enviado", d.getArquivoDados() != null,
            "tipo", d.getTipo(),
            "status", d.getStatus(),
            "nomeArquivo", d.getArquivoNome() == null ? "" : d.getArquivoNome(),
            "motivoReprovacao", d.getMotivoReprovacao() == null ? "" : d.getMotivoReprovacao()
        );
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> enviar(
            @RequestParam String tipo,
            @RequestPart("arquivo") MultipartFile arquivo,
            Authentication auth) throws IOException {

        Baba baba = babaService.buscarPorEmail(auth.getName());

        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("Selecione um arquivo.");
        }

        if (!Set.of("RG", "CNH", "CPF", "CERTIFICADO").contains(tipo)) {
            throw new IllegalArgumentException("Tipo de documento inválido.");
        }

        if (arquivo.getSize() > 10L * 1024 * 1024) {
            throw new IllegalArgumentException("O arquivo deve ter no máximo 10 MB.");
        }

        String ct = arquivo.getContentType() == null
                ? ""
                : arquivo.getContentType().toLowerCase();

        if (!(ct.equals("application/pdf")
                || ct.equals("image/jpeg")
                || ct.equals("image/png"))) {
            throw new IllegalArgumentException("Envie PDF, JPG ou PNG.");
        }

        DocumentoVerificacao d = repo.findByBabaId(baba.getId())
                .orElseGet(DocumentoVerificacao::new);

        d.setBaba(baba);
        d.setTipo(tipo);
        d.setStatus("PENDENTE");
        d.setMotivoReprovacao(null);
        d.setArquivoNome(arquivo.getOriginalFilename());
        d.setArquivoTipo(ct);
        d.setArquivoDados(arquivo.getBytes());

        repo.save(d);

        return Map.of(
            "enviado", true,
            "status", "PENDENTE",
            "tipo", tipo,
            "nomeArquivo", d.getArquivoNome()
        );
    }

    @GetMapping("/arquivo")
    public ResponseEntity<byte[]> arquivo(Authentication auth) {

        Baba baba = babaService.buscarPorEmail(auth.getName());

        DocumentoVerificacao d = repo.findByBabaId(baba.getId())
                .orElseThrow(() -> new IllegalArgumentException("Documento não encontrado."));

        if (d.getArquivoDados() == null) {
            throw new IllegalArgumentException("Arquivo não encontrado.");
        }

        String nomeArquivo = d.getArquivoNome() == null
                ? "documento"
                : d.getArquivoNome().replace("\"", "");

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(
                    d.getArquivoTipo() == null
                        ? "application/octet-stream"
                        : d.getArquivoTipo()
                ))
                .header("Content-Disposition",
                        "inline; filename=\"" + nomeArquivo + "\"")
                .body(d.getArquivoDados());
    }
}
