import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ApiService } from '../core/api.service';
import { msgErro } from '../core/util';
interface Plano { id:string; nome:string; precoMensal:number; limiteMensal:number; uso:string; beneficio:string; }
@Component({selector:'app-assinatura',standalone:true,imports:[CurrencyPipe],template:`
<section class="container pagina">
 <h1>Plano da sua família</h1><p class="muted">Escolha o plano que acompanha a frequência com que sua família contrata babás.</p>
 @if(erro()){<div class="aviso erro" role="alert">{{erro()}}</div>} @if(mensagem()){<div class="aviso" role="status">{{mensagem()}}</div>}
 @if(atual(); as a){<article class="caixa"><b>Plano atual: {{nome(a.plano)}}</b><p>Status: {{a.status}} </p></article>}
 @if(fidelidade(); as f){<article class="caixa"><h2>Fidelidade SafeBaba · {{f.nivel}}</h2><p><strong>{{f.pontos}} pontos</strong> · {{f.atendimentosConcluidos}} atendimentos concluídos</p><small class="muted">{{f.regra}}</small></article>}
 <div class="grade planos">
 @for(p of planos();track p.id){<article class="caixa">
  <h2>{{p.nome}}</h2><p><strong style="font-size:1.8rem">{{p.precoMensal|currency:'BRL'}}</strong><span class="muted"> / mês</span></p>
  <p>{{p.uso}}</p><p>{{p.beneficio}}</p>
  <button class="btn" type="button" (click)="escolher(p)" [disabled]="salvando()">{{atual()?.plano===p.id?'Plano atual':p.id==='GRATUITO'?'Usar gratuito':'Selecionar plano'}}</button>
 </article>}
 </div><p class="muted"></p>
</section>`,styles:[`.planos{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}`]})
export class AssinaturaComponent implements OnInit{
 private api=inject(ApiService); planos=signal<Plano[]>([]); atual=signal<any>(null); fidelidade=signal<any>(null); erro=signal('');mensagem=signal('');salvando=signal(false);
 ngOnInit(){this.api.minhaFidelidade().subscribe({next:f=>this.fidelidade.set(f),error:()=>this.fidelidade.set(null)});this.api.planosAssinatura().subscribe({next:p=>this.planos.set(p),error:e=>this.erro.set(msgErro(e))});this.carregar();}
 carregar(){this.api.minhaAssinatura().subscribe({next:a=>this.atual.set(a),error:e=>this.erro.set(msgErro(e))});}
 nome(id:string){return ({GRATUITO:'Gratuito',FAMILIA:'Família',FAMILIA_PLUS:'Família+'} as any)[id]||id;}
 escolher(p:Plano){this.salvando.set(true);this.mensagem.set('');this.api.assinarPlano(p.id).subscribe({next:r=>{this.mensagem.set(r.mensagem);this.carregar();this.salvando.set(false)},error:e=>{this.erro.set(msgErro(e));this.salvando.set(false)}})}
}
