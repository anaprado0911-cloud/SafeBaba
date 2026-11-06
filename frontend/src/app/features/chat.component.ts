import { Component, OnDestroy, OnInit, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common'; import { FormsModule } from '@angular/forms'; import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service'; import { AuthService } from '../core/auth.service'; import { msgErro } from '../core/util';
@Component({selector:'app-chat',standalone:true,imports:[FormsModule,DatePipe,RouterLink],template:`
<section class="container pagina estreita">
 <h1>Conversa com a babá</h1><p class="muted">Combine detalhes do atendimento por este canal. Evite compartilhar dados sensíveis desnecessários.</p>
 @if(erro()){<div class="aviso erro" role="alert">{{erro()}}</div>}
 <div class="caixa chat-lista" aria-live="polite">
 @if(mensagens().length===0){<p class="muted">Envie a primeira mensagem para iniciar a conversa.</p>}
 @for(m of mensagens();track m.id){<article class="mensagem"><b>{{m.remetente}}</b><p>{{m.conteudo}}</p><small class="muted">{{m.enviadaEm|date:'dd/MM/yyyy HH:mm'}}</small></article>}
 </div>
 <form class="acoes-linha" (ngSubmit)="enviar()"><label class="sr-only" for="texto-chat">Mensagem</label><input id="texto-chat" name="texto" maxlength="1000" [(ngModel)]="texto" placeholder="Digite sua mensagem..." required><button class="btn" type="submit" [disabled]="!texto.trim()">Enviar</button></form>
 <p><a routerLink="/babas">Voltar para babás</a></p>
</section>`,styles:[`.chat-lista{min-height:220px;max-height:55vh;overflow:auto}.mensagem{padding:.75rem;border-bottom:1px solid var(--linha)}.mensagem p{margin:.3rem 0;white-space:pre-wrap}`]})
export class ChatComponent implements OnInit,OnDestroy{
 babaId=input.required<string>(); private api=inject(ApiService); auth=inject(AuthService); conversa=0; mensagens=signal<any[]>([]); texto='';erro=signal('');private timer:any;private socket:WebSocket|null=null;private wsAtivo=false;
 ngOnInit(){const id=Number(this.babaId());if(!Number.isInteger(id)||id<=0){this.erro.set('Babá inválida.');return;}this.api.abrirConversa(id).subscribe({next:r=>{this.conversa=r.id;this.carregar();this.conectarTempoReal()},error:e=>this.erro.set(msgErro(e))});}
 ngOnDestroy(){if(this.timer)clearInterval(this.timer);if(this.socket){this.socket.onclose=null;this.socket.close()}}
 conectarTempoReal(){const token=this.auth.token();if(!token){this.iniciarPolling();return;}const proto=location.protocol==='https:'?'wss:':'ws:';this.socket=new WebSocket(`${proto}//${location.host}/ws/chat/${this.conversa}?token=${encodeURIComponent(token)}`);this.socket.onopen=()=>{this.wsAtivo=true;if(this.timer)clearInterval(this.timer);this.timer=null;};this.socket.onmessage=()=>this.carregar();this.socket.onerror=()=>{this.wsAtivo=false;this.iniciarPolling()};this.socket.onclose=()=>{this.wsAtivo=false;this.iniciarPolling()};setTimeout(()=>{if(!this.wsAtivo)this.iniciarPolling()},2500)}
 iniciarPolling(){if(!this.timer)this.timer=setInterval(()=>this.carregar(),4000)}
 carregar(){if(this.conversa)this.api.mensagensConversa(this.conversa).subscribe({next:m=>this.mensagens.set(m),error:e=>this.erro.set(msgErro(e))});}
 enviar(){const t=this.texto.trim();if(!t||!this.conversa)return;this.api.enviarMensagem(this.conversa,t).subscribe({next:()=>{this.texto='';this.carregar()},error:e=>this.erro.set(msgErro(e))});}
}
