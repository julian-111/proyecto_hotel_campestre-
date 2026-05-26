/**
 * ============================================================================
 * ARCHIVO: main.js (El Cerebro del Frontend)
 * AUTOR: Yo (El creador del proyecto)
 * 
 * PROPÓSITO:
 * Este archivo contiene toda la lógica de interactividad del lado del cliente. 
 * Lo estructuré utilizando funciones autoejecutables (IIFE) para no contaminar 
 * el ámbito global (window) y mantener mi código seguro y modular. 
 * Aquí manejo cosas como el resaltado automático de la página activa en el 
 * menú de navegación y los efectos visuales complejos (como el canvas de luciérnagas).
 * 
 * COMUNICACIÓN CON EL BACKEND:
 * La parte más crucial que programé aquí es la gestión del formulario de contacto 
 * (ver sección "contactForm"). Escribí una función que intercepta el evento "submit" 
 * del formulario, previene que la página se recargue y primero valida los datos.
 * Una vez validados, empaqueta la información y la envía a mi servidor Node.js 
 * a través de una petición fetch asíncrona.
 * ============================================================================
 */
(() => {
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const pagePath = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  qsa("[data-nav]").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    const isActive = (href === pagePath) || (pagePath === "" && href === "index.html");
    if (isActive) {
      a.setAttribute("aria-current", "page");
      a.classList.add("text-white");
      a.classList.remove("text-slate-200/80");
    }
  });

  // Mantener la animación activada siempre por defecto
  document.documentElement.dataset.motion = "on";

  const toast = (() => {
    const el = qs("#toast");
    if (!el) return null;
    const title = qs("[data-toast-title]", el);
    const msg = qs("[data-toast-msg]", el);
    const closeBtn = qs("[data-toast-close]", el);
    let t = null;
    closeBtn?.addEventListener("click", () => {
      el.dataset.open = "false";
      if (t) window.clearTimeout(t);
    });
    return (payload) => {
      if (!payload) return;
      if (title) title.textContent = payload.title || "Listo";
      if (msg) msg.textContent = payload.message || "";
      el.dataset.open = "true";
      if (t) window.clearTimeout(t);
      t = window.setTimeout(() => (el.dataset.open = "false"), 4200);
    };
  })();

  const fireflies = (() => {
    const canvas = qs("#fireflies");
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const state = {
      w: 0,
      h: 0,
      dpr: Math.max(1, Math.min(2, window.devicePixelRatio || 1)),
      flies: [],
      running: true
    };

    const rand = (min, max) => min + Math.random() * (max - min);
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

    const resize = () => {
      state.w = window.innerWidth;
      state.h = window.innerHeight;
      canvas.width = Math.floor(state.w * state.dpr);
      canvas.height = Math.floor(state.h * state.dpr);
      canvas.style.width = `${state.w}px`;
      canvas.style.height = `${state.h}px`;
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    };

    const seed = () => {
      const count = clamp(Math.floor((state.w * state.h) / 42000), 18, 48);
      state.flies = Array.from({ length: count }, () => {
        const hue = rand(38, 66);
        return {
          x: rand(0, state.w),
          y: rand(0, state.h),
          r: rand(1.3, 3.2),
          a: rand(0.08, 0.22),
          vx: rand(-0.22, 0.22),
          vy: rand(-0.18, 0.18),
          phase: rand(0, Math.PI * 2),
          hue
        };
      });
    };

    const draw = (t) => {
      if (!state.running) return;
      ctx.clearRect(0, 0, state.w, state.h);
      const motionAllowed = document.documentElement.dataset.motion !== "off";
      const time = t * 0.001;

      for (const f of state.flies) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 1.8 + f.phase);
        const alpha = f.a * (0.55 + pulse * 0.75);
        const glow = 8 + pulse * 18;
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glow);
        g.addColorStop(0, `hsla(${f.hue}, 95%, 65%, ${alpha})`);
        g.addColorStop(1, `hsla(${f.hue}, 95%, 65%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, glow, 0, Math.PI * 2);
        ctx.fill();

        if (motionAllowed) {
          f.x += f.vx;
          f.y += f.vy;
          if (f.x < -40) f.x = state.w + 40;
          if (f.x > state.w + 40) f.x = -40;
          if (f.y < -40) f.y = state.h + 40;
          if (f.y > state.h + 40) f.y = -40;
        }
      }

      requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      state.running = !document.hidden;
      if (state.running) requestAnimationFrame(draw);
    };

    resize();
    seed();
    requestAnimationFrame(draw);
    window.addEventListener("resize", () => {
      resize();
      seed();
    });
    document.addEventListener("visibilitychange", onVisibility);
    return { resize, seed };
  })();

  const quickStayPlanner = (() => {
    const root = qs("[data-stay-planner]");
    if (!root) return null;

    const nights = qs("#nights", root);
    const guests = qs("#guests", root);
    const vibe = qs("#vibe", root);
    const out = qs("[data-stay-output]", root);
    const cta = qs("[data-stay-cta]", root);

    const formatCOP = (num) =>
      new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(num);

    const base = 260000;
    const perGuest = 65000;
    const vibeFactor = {
      descanso: 1,
      aventura: 1.08,
      romance: 1.12
    };

    const compute = () => {
      const n = Number(nights?.value || 1);
      const g = Number(guests?.value || 2);
      const v = String(vibe?.value || "descanso");
      const est = Math.round((base * n + Math.max(0, g - 2) * perGuest * n) * (vibeFactor[v] || 1));
      const title =
        v === "romance"
          ? "Plan Romance Campestre"
          : v === "aventura"
            ? "Plan Aventura Verde"
            : "Plan Descanso Total";

      const bullets =
        v === "romance"
          ? ["Cabaña iluminada con luciérnagas", "Cena bajo estrellas", "Amanecer con café de origen"]
          : v === "aventura"
            ? ["Sendero guiado y mirador", "Fogata segura con kit", "Ruta en bici señalizada"]
            : ["Silencio + hamacas", "Aromas naturales", "Piscina templada al atardecer"];

      if (out) {
        out.innerHTML = `
          <div class="flex flex-col gap-2">
            <div class="text-lg md:text-xl font-semibold text-white">${title}</div>
            <div class="text-slate-200/80 text-sm">Estimado para ${n} noche(s) · ${g} huésped(es)</div>
            <div class="text-2xl md:text-3xl font-bold bg-clip-text text-transparent"
              style="background-image: linear-gradient(90deg, rgba(var(--brand-sunset), 1), rgba(var(--brand-orchid), 1), rgba(var(--brand-sky), 1));">
              ${formatCOP(est)}
            </div>
            <ul class="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-100/90">
              ${bullets
                .map(
                  (b) =>
                    `<li class="glass rounded-xl px-3 py-2 flex gap-2 items-start"><span class="mt-1 h-2 w-2 rounded-full" style="background: rgba(var(--brand-forest), 1)"></span><span>${b}</span></li>`
                )
                .join("")}
            </ul>
          </div>
        `;
      }

      if (cta) {
        const text = encodeURIComponent(
          `Hola, quiero el ${title} para ${g} huésped(es) por ${n} noche(s). ¿Qué disponibilidad tienen?`
        );
        cta.setAttribute("href", `https://wa.me/?text=${text}`);
      }
    };

    [nights, guests, vibe].forEach((el) => el?.addEventListener("input", compute));
    compute();
    return { compute };
  })();

  const roomFilters = (() => {
    const root = qs("[data-rooms]");
    if (!root) return null;

    const chips = qsa("[data-filter]", root);
    const cards = qsa("[data-room]", root);
    const out = qs("[data-rooms-count]", root);

    const apply = () => {
      const active = chips.filter((c) => c.getAttribute("aria-pressed") === "true").map((c) => c.dataset.filter);
      const shouldShow = (card) => {
        if (active.length === 0) return true;
        const tags = (card.dataset.tags || "").split(",").map((t) => t.trim());
        return active.every((a) => tags.includes(a));
      };

      let visible = 0;
      for (const card of cards) {
        const ok = shouldShow(card);
        card.classList.toggle("hidden", !ok);
        if (ok) visible += 1;
      }
      if (out) out.textContent = `${visible} opción(es)`;
    };

    for (const chip of chips) {
      chip.addEventListener("click", () => {
        const next = chip.getAttribute("aria-pressed") !== "true";
        chip.setAttribute("aria-pressed", next ? "true" : "false");
        apply();
      });
    }

    apply();
    return { apply };
  })();

  const accordion = (() => {
    qsa("[data-accordion]").forEach((root) => {
      qsa("[data-acc-trigger]", root).forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("aria-controls");
          const panel = id ? qs(`#${CSS.escape(id)}`) : null;
          const expanded = btn.getAttribute("aria-expanded") === "true";
          btn.setAttribute("aria-expanded", expanded ? "false" : "true");
          if (panel) panel.hidden = expanded ? true : false;
        });
      });
    });
  })();

  const contactForm = (() => {
    const form = qs("#contact-form");
    if (!form) return null;

    const name = qs("#name", form);
    const email = qs("#email", form);
    const phone = qs("#phone", form);
    const dates = qs("#dates", form);
    const message = qs("#message", form);

    const setInvalid = (el, msg) => {
      const field = el?.closest("[data-field]");
      const help = field ? qs("[data-error]", field) : null;
      if (field) field.dataset.invalid = "true";
      if (help) help.textContent = msg || "Revisa este campo";
    };

    const clearInvalid = (el) => {
      const field = el?.closest("[data-field]");
      const help = field ? qs("[data-error]", field) : null;
      if (field) field.dataset.invalid = "false";
      if (help) help.textContent = "";
    };

    const validate = () => {
      let ok = true;
      const n = String(name?.value || "").trim();
      const e = String(email?.value || "").trim();
      const p = String(phone?.value || "").trim();
      const d = String(dates?.value || "").trim();
      const m = String(message?.value || "").trim();

      clearInvalid(name);
      clearInvalid(email);
      clearInvalid(phone);
      clearInvalid(dates);
      clearInvalid(message);

      if (n.length < 2) {
        setInvalid(name, "Escribe tu nombre");
        ok = false;
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
      if (!emailOk) {
        setInvalid(email, "Escribe un correo válido");
        ok = false;
      }

      if (p && !/^[0-9+\s()-]{7,}$/.test(p)) {
        setInvalid(phone, "Escribe un teléfono válido (opcional)");
        ok = false;
      }

      if (d.length < 4) {
        setInvalid(dates, "Indica tus fechas aproximadas");
        ok = false;
      }

      if (m.length < 12) {
        setInvalid(message, "Cuéntanos qué necesitas (mínimo 12 caracteres)");
        ok = false;
      }

      return ok;
    };

    qsa("input, textarea", form).forEach((el) => {
      el.addEventListener("input", () => clearInvalid(el));
    });

    /**
     * ============================================================================
     * CONEXIÓN CON EL BACKEND (EXPRESS + PYTHON)
     * 
     * Aquí es donde ocurre la magia de la comunicación.
     * En lugar de dejar que el formulario recargue la página, yo intercepto el
     * evento de envío ('submit').
     * ============================================================================
     */
    form.addEventListener("submit", async (ev) => {
      // 1. Detengo el comportamiento por defecto (recargar la página)
      ev.preventDefault();
      
      // 2. Ejecuto mi propia función de validación
      if (!validate()) {
        toast?.({ title: "Faltan datos", message: "Revisa los campos marcados para continuar." });
        return;
      }
      
      // 3. Cambio el texto del botón para darle feedback al usuario
      const submitBtn = qs('button[type="submit"]', form);
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando...";
      }

      try {
        // 4. Hago la petición HTTP a mi servidor de Node.js (que corre en el puerto 3000)
        //    Le paso los datos del formulario convertidos a formato JSON.
        const response = await fetch('http://localhost:3000/api/procesar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            dates: dates.value.trim(),
            message: message.value.trim()
          })
        });

        // 5. Verifico si mi servidor backend respondió con un error 
        if (!response.ok) {
          throw new Error('Error en el servidor');
        }

        // 6. Convierto la respuesta de Express (que viene de Python) a un objeto JS
        const data = await response.json();
        
        // Limpio el formulario porque todo salió bien
        form.reset();
        
        // 7. Uso mi sistema de notificaciones (Toast) para mostrar el mensaje
        //    inteligente que me devolvió Python (data.message).
        toast?.({ 
          title: "¡Reserva Solicitada!", 
          message: data.message || "Te responderemos pronto." 
        });

      } catch (error) {
        // 8. Si Express está apagado o Python falló, le aviso al usuario elegantemente
        console.error("Error al enviar el formulario:", error);
        toast?.({ 
          title: "Error de conexión", 
          message: "No se pudo conectar con el servidor backend. Intenta nuevamente." 
        });
      } finally {
        // 9. Pase lo que pase (éxito o error), restauro el botón a su estado original
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Enviar mensaje";
        }
      }
    });

    return { validate };
  })();

  // ============================================================================
  // AUTENTICACIÓN Y CITAS (INTEGRACIÓN CON NUEVA API)
  // ============================================================================
  const authSystem = (() => {
    const API_URL = "http://localhost:3000/api";

    // --- Manejo del Token y Estado de Sesión ---
    const getToken = () => localStorage.getItem('bruma_token');
    const setToken = (token) => localStorage.setItem('bruma_token', token);
    const removeToken = () => {
      localStorage.removeItem('bruma_token');
      localStorage.removeItem('bruma_user');
    };
    const getUser = () => {
      try { return JSON.parse(localStorage.getItem('bruma_user')); }
      catch { return null; }
    };
    const setUser = (user) => localStorage.setItem('bruma_user', JSON.stringify(user));

    const isAuthenticated = () => !!getToken();
    
    const logout = () => {
        removeToken();
        window.location.href = './index.html';
    };

    // Actualizar UI del Header
    const updateHeader = () => {
      const authLinks = qsa('[data-auth-link]'); // Podría haber varios en mobile/desktop
      const logoutBtns = qsa('[data-logout-btn]');

      if (isAuthenticated()) {
        const user = getUser();
        authLinks.forEach(link => {
          if (user && (user.rol === 'administrador' || user.rol === 'ADMIN')) {
            link.textContent = "Panel Admin";
            link.href = "./admin-dashboard.html";
          } else {
            link.textContent = "Mis Citas";
            link.href = "./mis-citas.html";
          }
        });
        logoutBtns.forEach(btn => btn.classList.remove('hidden'));
      } else {
        authLinks.forEach(link => {
          link.textContent = "Iniciar Sesión";
          link.href = "./login.html";
        });
        logoutBtns.forEach(btn => btn.classList.add('hidden'));
      }

      logoutBtns.forEach(btn => {
        // Remover event listeners anteriores si se llama múltiple veces
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', () => {
          logout();
        });
      });
    };

    updateHeader();

    // --- Formularios de Autenticación ---
    const loginForm = qs('#login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = qs('#login-email', loginForm).value.trim();
        const password = qs('#login-password', loginForm).value;
        const btn = qs('button[type="submit"]', loginForm);
        
        btn.disabled = true;
        btn.textContent = "Iniciando...";

        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: email, contrasena: password })
          });
          const data = await res.json();
          if (res.ok) {
            setToken(data.datos.token); // Dependiendo de la estructura exacta devuelta
            setUser(data.datos.usuario || { correo: email });
            
            // Redirección basada en roles
            if (data.datos.usuario && (data.datos.usuario.rol === 'administrador' || data.datos.usuario.rol === 'ADMIN')) {
              window.location.href = './admin-dashboard.html';
            } else {
              window.location.href = './mis-citas.html';
            }
          } else {
            toast?.({ title: "Error", message: data.mensaje || "Credenciales inválidas" });
          }
        } catch (err) {
          toast?.({ title: "Error", message: "Error al conectar con el servidor." });
        } finally {
          btn.disabled = false;
          btn.textContent = "Ingresar";
        }
      });
    }

    const registerForm = qs('#register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = qs('#reg-name', registerForm).value.trim();
        const email = qs('#reg-email', registerForm).value.trim();
        const password = qs('#reg-password', registerForm).value;
        const btn = qs('button[type="submit"]', registerForm);
        
        btn.disabled = true;
        btn.textContent = "Registrando...";

        try {
          const res = await fetch(`${API_URL}/auth/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: name, correo: email, contrasena: password })
          });
          const data = await res.json();
          if (res.ok || res.status === 201) {
            toast?.({ title: "Registro Exitoso", message: "Ahora puedes iniciar sesión." });
            setTimeout(() => window.location.href = './login.html', 2000);
          } else {
            toast?.({ title: "Error", message: data.mensaje || "El usuario ya existe o faltan datos." });
          }
        } catch (err) {
          toast?.({ title: "Error", message: "Error al conectar con el servidor." });
        } finally {
          btn.disabled = false;
          btn.textContent = "Registrarme";
        }
      });
    }

    // --- Cargar servicios dinámicamente desde la base de datos ---
    const loadServices = async () => {
      const select = qs('#app-service');
      const listContainer = qs('#dynamic-services-list');
      
      if (!select && !listContainer) return;
      
      try {
        const res = await fetch(`${API_URL}/servicios`);
        if (res.ok) {
          const data = await res.json();
          if (data.servicios && data.servicios.length > 0) {
            
            // 1. Poblar el formulario de reserva (si existe)
            if (select) {
              select.innerHTML = '<option value="" disabled selected>Selecciona un servicio...</option>';
              data.servicios.forEach(srv => {
                const option = document.createElement('option');
                option.value = srv.nombre;
                option.textContent = srv.nombre;
                select.appendChild(option);
              });
            }

            // 2. Poblar la página de servicios (si existe)
            if (listContainer) {
              listContainer.innerHTML = data.servicios.map((srv, index) => `
                <div class="pill rounded-2xl p-4">
                  <button class="ring-focus w-full text-left flex items-center justify-between gap-4" data-acc-trigger aria-expanded="false" aria-controls="acc-${index}" type="button">
                    <span class="text-white font-semibold">${srv.nombre} ${parseFloat(srv.precio) > 0 ? '($' + parseFloat(srv.precio) + ')' : '(Gratis)'}</span>
                    <span class="text-slate-200/70 text-sm">Ver</span>
                  </button>
                  <div id="acc-${index}" hidden class="mt-3 text-sm text-slate-200/70 leading-relaxed">
                    ${srv.descripcion}
                  </div>
                </div>
              `).join('');

              // Re-inicializar event listeners de los acordeones dinámicos
              const triggers = qsa('[data-acc-trigger]', listContainer);
              triggers.forEach(btn => {
                btn.addEventListener('click', () => {
                  const expanded = btn.getAttribute('aria-expanded') === 'true';
                  const controls = btn.getAttribute('aria-controls');
                  const content = document.getElementById(controls);
                  
                  btn.setAttribute('aria-expanded', !expanded);
                  if (content) {
                    if (expanded) content.setAttribute('hidden', '');
                    else content.removeAttribute('hidden');
                  }
                });
              });
            }
          } else if (listContainer) {
            listContainer.innerHTML = '<p class="text-slate-200/70 text-center py-4">No hay servicios disponibles en este momento.</p>';
          }
        }
      } catch (err) {
        console.error("Error al cargar servicios", err);
        if (listContainer) {
           listContainer.innerHTML = '<p class="text-rose-400 text-center py-4">Error al cargar la lista de servicios.</p>';
        }
      }
    };

    // Llamar la carga de servicios sin importar si está autenticado
    loadServices();
      const appointmentsList = qs('#appointments-list');
      const loadAppointments = async () => {
        if (!appointmentsList) return;
        try {
          const res = await fetch(`${API_URL}/citas`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
          });
          if (res.status === 401) {
            removeToken();
            window.location.href = './login.html';
            return;
          }
          const data = await res.json();
          const citas = data.citas || (Array.isArray(data) ? data : []); 
          
          const loading = qs('#appointments-loading');
          const empty = qs('#appointments-empty');
          
          if (loading) loading.classList.add('hidden');

          if (!citas || citas.length === 0) {
            if (empty) empty.classList.remove('hidden');
            appointmentsList.classList.add('hidden');
          } else {
            if (empty) empty.classList.add('hidden');
            appointmentsList.classList.remove('hidden');
            
            appointmentsList.innerHTML = citas.map(cita => `
              <div class="glass rounded-2xl p-4 flex flex-col sm:flex-row justify-between gap-4 border border-white/5">
                <div>
                  <div class="font-bold text-white text-lg">${cita.servicio && cita.servicio !== 'Ninguno' ? cita.servicio : 'Reserva de Habitación'}</div>
                  ${cita.habitacion && cita.habitacion !== 'Ninguna' ? `<div class="text-sm text-emerald-400 font-medium mt-1">Habitaciones: ${cita.habitacion}</div>` : ''}
                  <div class="text-sm text-slate-300 mt-1 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    ${new Date(cita.fecha).toLocaleString('es-CO')}
                  </div>
                </div>
                <div class="flex flex-col sm:items-end justify-between">
                  <span class="inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase ${cita.estado === 'confirmada' ? 'bg-emerald-500/20 text-emerald-400' : cita.estado === 'cancelada' ? 'bg-rose-500/20 text-rose-400' : 'bg-orange-500/20 text-orange-400'}">
                    ${cita.estado}
                  </span>
                  ${cita.estado !== 'cancelada' && cita.estado !== 'completada' ? `
                    <div class="flex gap-2 mt-3 sm:mt-0">
                      <button onclick="window.reprogramarCita('${cita.id}')" class="text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors">Reprogramar</button>
                      <button onclick="window.cancelarCita('${cita.id}')" class="text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition-colors">Cancelar</button>  
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('');
          }
        } catch (err) {
          console.error(err);
          toast?.({ title: "Error", message: "No se pudieron cargar las citas." });
        }
      };

      loadAppointments();

      // Exponer funciones globales para los botones de las citas
      window.cancelarCita = async (id) => {
        if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;
        
        try {
          const res = await fetch(`${API_URL}/citas/${id}/cancelar`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${getToken()}` }
          });
          
          if (res.ok) {
            toast?.({ title: "Cita Cancelada", message: "La cita ha sido cancelada." });
            loadAppointments(); // Recargar la lista
          } else {
            toast?.({ title: "Error", message: "No se pudo cancelar la cita." });
          }
        } catch (err) {
          toast?.({ title: "Error", message: "Error de conexión." });
        }
      };

      // Variable para rastrear si estamos editando una cita
      let editingCitaId = null;

      window.reprogramarCita = (id) => {
        editingCitaId = id;
        toast?.({ 
          title: "Modo Reprogramación", 
          message: "Selecciona los nuevos servicios, habitaciones y fecha, y presiona Confirmar Cita para actualizarla." 
        });
        
        const btn = qs('button[type="submit"]', appointmentForm);
        if(btn) btn.textContent = "Guardar Cambios (Reprogramar)";
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      const userNameEl = qs('#user-name');
      const user = getUser();
      if (userNameEl && user && user.nombre) {
        userNameEl.textContent = user.nombre.split(' ')[0];
      }

      const appointmentForm = qs('#appointment-form');
      
      // --- Carga de Opciones desde la Base de Datos ---
      const loadSelectOptions = async () => {
        const serviceSelect = qs('#app-service', appointmentForm);
        const roomSelect = qs('#app-room', appointmentForm);
        
        if (!serviceSelect || !roomSelect) return;

        try {
          // Intentar obtener servicios de la BD
          const resServicios = await fetch(`${API_URL}/servicios`);
          if (resServicios.ok) {
            const dataS = await resServicios.json();
            const serviciosDB = dataS.servicios || (Array.isArray(dataS) ? dataS : []);
            serviceSelect.innerHTML = serviciosDB.map(s => `
              <label class="cursor-pointer">
                <input type="checkbox" name="servicios[]" value="${s.id_servicio || s.id}" class="peer sr-only">
                <div class="rounded-xl px-4 py-2 text-sm font-medium bg-slate-950/40 border border-slate-400/20 text-slate-300 peer-checked:bg-emerald-500 peer-checked:text-white peer-checked:border-emerald-400 hover:bg-slate-800 transition-all">
                  ${s.nombre || s.servicio}
                </div>
              </label>
            `).join('');
          } else {
            throw new Error('Endpoint de servicios no disponible');
          }
        } catch (error) {
          serviceSelect.innerHTML = `<span class="text-rose-400 text-sm">Error al cargar servicios.</span>`;
        }

        try {
          // Intentar obtener habitaciones de la BD
          const resHabitaciones = await fetch(`${API_URL}/habitaciones`);
          if (resHabitaciones.ok) {
            const dataH = await resHabitaciones.json();
            const habitacionesDB = dataH.habitaciones || (Array.isArray(dataH) ? dataH : []);
            roomSelect.innerHTML = habitacionesDB.map(h => `
              <label class="cursor-pointer">
                <input type="checkbox" name="habitaciones[]" value="${h.id_habitacion || h.id}" class="peer sr-only">
                <div class="rounded-xl px-4 py-2 text-sm font-medium bg-slate-950/40 border border-slate-400/20 text-slate-300 peer-checked:bg-emerald-500 peer-checked:text-white peer-checked:border-emerald-400 hover:bg-slate-800 transition-all">
                  ${h.nombre || h.tipo}
                </div>
              </label>
            `).join('');
          } else {
            throw new Error('Endpoint de habitaciones no disponible');
          }
        } catch (error) {
          roomSelect.innerHTML = `<span class="text-rose-400 text-sm">Error al cargar habitaciones.</span>`;
        }
      };

      if (appointmentForm) {
        loadSelectOptions(); // Llamar a la carga de opciones

        appointmentForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          const formData = new FormData(appointmentForm);
          const servicios = formData.getAll('servicios[]');
          const habitaciones = formData.getAll('habitaciones[]');
          const fecha = qs('#app-date', appointmentForm).value;
          const btn = qs('button[type="submit"]', appointmentForm);

          if (servicios.length === 0 && habitaciones.length === 0) {
            toast?.({ title: "Atención", message: "Selecciona al menos un servicio o habitación." });
            return;
          }
          
          btn.disabled = true;
          btn.textContent = "Agendando...";

          try {
            const url = editingCitaId ? `${API_URL}/citas/${editingCitaId}` : `${API_URL}/citas`;
            const method = editingCitaId ? 'PUT' : 'POST';

            const res = await fetch(url, {
              method: method,
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
              },
              body: JSON.stringify({ 
                servicios: servicios, 
                habitaciones: habitaciones,
                fecha 
              })
            });
            const data = await res.json();
            
            if (res.ok || res.status === 201) {
              toast?.({ title: editingCitaId ? "Cita Reprogramada" : "Cita Agendada", message: data.mensaje || "Tu cita ha sido procesada con éxito." });
              appointmentForm.reset();
              editingCitaId = null; // Resetear modo edición
              loadAppointments(); // Recargar lista
            } else {
              toast?.({ title: "Error", message: data.error || data.mensaje || "Error al procesar la cita." });
            }
          } catch (err) {
            toast?.({ title: "Error", message: "Error al conectar con el servidor." });
          } finally {
            btn.disabled = false;
            btn.textContent = "Confirmar Cita";
            editingCitaId = null;
          }
        });
      }
    return { isAuthenticated, getToken, getUser, logout };
  })();
  // ============================================================================
  // (Header, Menú Móvil)
  // ============================================================================
  const uiSystem = (() => {
    // Menú móvil global
    const mobileBtn = qs('#mobile-menu-btn');
    const mobileMenu = document.createElement('div');
    mobileMenu.id = 'mobile-menu';
    mobileMenu.className = 'fixed inset-0 z-40 bg-black/95 backdrop-blur-xl hidden flex-col pt-24 px-6';
    document.body.appendChild(mobileMenu);

    let isMobileMenuOpen = false;

    const toggleMobileMenu = () => {
      isMobileMenuOpen = !isMobileMenuOpen;
      if (isMobileMenuOpen) {
        mobileMenu.classList.remove('hidden');
        mobileMenu.classList.add('flex');
        document.body.style.overflow = 'hidden';
      } else {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        document.body.style.overflow = '';
      }
    };

    if (mobileBtn) {
      mobileBtn.addEventListener('click', toggleMobileMenu);
    }

    // Actualización de la UI dependiendo del estado de sesión
    const updateHeader = () => {
      const headerNav = qs('nav');
      const user = authSystem.getUser();
      const isAuth = authSystem.isAuthenticated();

      // Desktop Nav
      if (headerNav) {
        // Limpiamos los enlaces dinámicos anteriores (si los hay)
        const dynamicLinks = qsa('.auth-dynamic', headerNav);
        dynamicLinks.forEach(el => el.remove());

        if (isAuth && user) {
          // Agregar botones de usuario logueado
          const authHtml = `
            <div class="auth-dynamic flex items-center gap-4 ml-4">
              <div class="h-4 w-px bg-white/10"></div>
              <a href="./perfil.html" class="flex items-center gap-2 group cursor-pointer" title="Ver mi perfil">
                <div class="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold group-hover:bg-emerald-500/30 transition-colors">
                  ${user.nombre.charAt(0).toUpperCase()}
                </div>
                <span class="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">${user.nombre.split(' ')[0]}</span>
              </a>
              <a href="./mis-citas.html" class="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors ml-2">Mis Citas</a>
              <button id="btn-logout-desktop" class="text-sm font-medium text-rose-400 hover:text-rose-300 transition-colors ml-2">Cerrar Sesión</button>
            </div>
          `;
          headerNav.insertAdjacentHTML('beforeend', authHtml);

          qs('#btn-logout-desktop')?.addEventListener('click', () => {
            authSystem.logout();
          });
        } else {
          // Usuario NO logueado
          const loginHtml = `
            <div class="auth-dynamic flex items-center gap-4 ml-4">
              <div class="h-4 w-px bg-white/10"></div>
              <a href="./login.html" class="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors">Iniciar Sesión</a>
            </div>
          `;
          headerNav.insertAdjacentHTML('beforeend', loginHtml);
        }
      }

      // Mobile Menu
      if (mobileMenu) {
        if (isAuth && user) {
          mobileMenu.innerHTML = `
            <a href="./index.html" class="text-2xl font-bold text-white mb-6">Inicio</a>
            <a href="./habitaciones.html" class="text-2xl font-bold text-white mb-6">Habitaciones</a>
            
            <div class="space-y-4 pt-6 border-t border-white/10 mt-auto mb-10">
              <div class="flex items-center gap-3 px-2">
                <div class="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl">
                  ${user.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div class="text-white font-medium text-lg">${user.nombre}</div>
                  <div class="text-sm text-slate-400">${user.correo}</div>
                </div>
              </div>
              <a href="./perfil.html" class="block text-lg font-medium text-slate-200 hover:text-emerald-400 transition-colors px-2 py-2 hover:bg-white/5 rounded-xl">Mi Perfil</a>
              <a href="./mis-citas.html" class="block text-lg font-medium text-slate-200 hover:text-emerald-400 transition-colors px-2 py-2 hover:bg-white/5 rounded-xl">Mis Citas</a>
              <button id="btn-logout-mobile" class="w-full text-left text-lg font-medium text-rose-400 hover:text-rose-300 transition-colors px-2 py-2 hover:bg-rose-500/10 rounded-xl">Cerrar Sesión</button>
            </div>
          `;
          
          qs('#btn-logout-mobile')?.addEventListener('click', () => {
            authSystem.logout();
          });
        } else {
          mobileMenu.innerHTML = `
            <a href="./index.html" class="text-2xl font-bold text-white mb-6">Inicio</a>
            <a href="./habitaciones.html" class="text-2xl font-bold text-white mb-6">Habitaciones</a>
            <a href="./contactanos.html" class="text-2xl font-bold text-white mb-6">Contacto</a>
            
            <div class="space-y-4 pt-6 border-t border-white/10 mt-auto mb-10">
              <a href="./login.html" class="block text-center text-lg font-medium text-emerald-400 bg-emerald-500/10 transition-colors px-4 py-3 hover:bg-emerald-500/20 rounded-xl">Iniciar Sesión</a>
              <a href="./registro.html" class="block text-center text-lg font-medium text-slate-300 transition-colors px-4 py-3 hover:bg-white/5 rounded-xl border border-white/10">Registrarse</a>
            </div>
          `;
        }
      }
    };

    // Exportar función para que pueda ser llamada al iniciar
    return { updateHeader };
  })();

  // Llenar el header al cargar
  document.addEventListener('DOMContentLoaded', () => {
    uiSystem.updateHeader();
  });

  // ============================================================================
  // SISTEMA DE PERFIL DE USUARIO
  // ============================================================================
  const profileSystem = (() => {
    const perfilForm = qs('#perfil-form');
    if (!perfilForm) return null; // Solo se ejecuta en perfil.html

    const API_URL = "http://localhost:3000/api";

    if (!authSystem.isAuthenticated()) {
      window.location.href = './login.html';
      return null;
    }

    const inputNombre = qs('#perfil-nombre');
    const inputCorreo = qs('#perfil-correo');
    const inputTelefono = qs('#perfil-telefono');
    const inputPassword = qs('#perfil-password');
    const btnSave = qs('#btn-save-profile');
    const btnDelete = qs('#btn-delete-account');

    // Cargar datos actuales
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/perfil`, {
          headers: { 'Authorization': `Bearer ${authSystem.getToken()}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          const perfil = data.perfil || data;
          if (inputNombre) inputNombre.value = perfil.nombre || '';
          if (inputCorreo) inputCorreo.value = perfil.correo || '';
          if (inputTelefono) inputTelefono.value = perfil.telefono || '';
        } else {
          toast?.({ title: "Error", message: "No se pudieron cargar los datos del perfil." });
        }
      } catch (error) {
        console.error("Error al cargar perfil", error);
      }
    };

    // Actualizar datos
    perfilForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      btnSave.disabled = true;
      btnSave.textContent = "Guardando...";

      const bodyData = {
        nombre: inputNombre.value,
        correo: inputCorreo.value,
        telefono: inputTelefono?.value || ''  
      };

      if (inputPassword.value.trim() !== '') {
        bodyData.contrasena = inputPassword.value;
      }

      try {
        const res = await fetch(`${API_URL}/perfil`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authSystem.getToken()}`
          },
          body: JSON.stringify(bodyData)
        });

        if (res.ok) {
          toast?.({ title: "Éxito", message: "Perfil actualizado correctamente." });
          inputPassword.value = ''; // Limpiar campo de contraseña por seguridad
          
          // Actualizar el nombre en el localStorage si existe
          const user = authSystem.getUser();
          if (user) {
            user.nombre = bodyData.nombre;
            localStorage.setItem('bruma_user', JSON.stringify(user));
          }
        } else {
          const err = await res.json();
          toast?.({ title: "Error", message: err.error || err.mensaje || "Error al actualizar." });
        }
      } catch (error) {
        toast?.({ title: "Error", message: "Error de conexión." });
      } finally {
        btnSave.disabled = false;
        btnSave.textContent = "Guardar Cambios";
      }
    });

    // Dar de baja la cuenta
    btnDelete?.addEventListener('click', async () => {
      if (confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer y cancelará todas tus citas pendientes.")) {
        try {
          const res = await fetch(`${API_URL}/perfil`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authSystem.getToken()}` }
          });
          
          if (res.ok) {
            alert("Tu cuenta ha sido eliminada.");
            qs('#btn-logout')?.click(); // Forzar cierre de sesión y redirección
          } else {
            toast?.({ title: "Error", message: "No se pudo eliminar la cuenta." });
          }
        } catch (error) {
          toast?.({ title: "Error", message: "Error de conexión." });
        }
      }
    });

    loadProfile();
  })();


  // ============================================================================
  // PANEL DE ADMINISTRACIÓN (VISTA DE LISTA)
  // ============================================================================
  const adminSystem = (() => {
    const listContainer = qs('#admin-list-container');
    if (!listContainer) return null; // Solo se ejecuta si estamos en admin-dashboard.html

    // --- PROTECCIÓN DE RUTA DE ADMINISTRADOR ---
    const user = authSystem.getUser();
    if (!authSystem.isAuthenticated() || !user || (user.rol !== 'administrador' && user.rol !== 'ADMIN')) {
      console.warn('Acceso denegado: Se requiere rol de administrador.');
      window.location.href = './login.html';
      return null;
    }

    const API_URL = "http://localhost:3000/api";
    let appointments = [];
    let filteredAppointments = [];

    const totalCount = qs('#admin-total-count');
    const filterForm = qs('#admin-filters');
    const searchInput = qs('#admin-search');
    const loadingState = qs('#admin-loading');
    const emptyState = qs('#admin-empty');

    // --- Modal ---
    const modal = qs('#admin-modal');
    const modalOverlay = qs('#admin-modal-overlay');
    const modalClose = qs('#admin-modal-close');
    const modalContent = qs('#admin-modal-content');
    const modalConfirmBtn = qs('#admin-modal-confirm-btn'); // Botón para confirmar
    let currentSelectedCitaId = null;

    const openModal = (cita) => {
      currentSelectedCitaId = cita.id;
      qs('#modal-service').textContent = cita.servicio && cita.servicio !== 'Ninguno' ? cita.servicio : 'Reserva';
      qs('#modal-client').textContent = cita.usuario_nombre ? `${cita.usuario_nombre} (${cita.usuario_correo})` : (cita.usuario_id ? `Usuario #${cita.usuario_id}` : 'Cliente Anónimo');
      
      const roomsEl = qs('#modal-rooms');
      if (roomsEl) {
        roomsEl.textContent = cita.habitacion && cita.habitacion !== 'Ninguna' ? cita.habitacion : 'No solicitada';
      }

      const d = new Date(cita.fecha);
      qs('#modal-date').textContent = d.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      qs('#modal-time').textContent = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      
      const statusEl = qs('#modal-status');
      statusEl.textContent = cita.estado.toUpperCase();
      statusEl.className = 'px-2 py-1 rounded-md text-xs font-bold ' + 
        (cita.estado === 'CONFIRMADA' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400');

      if (modalConfirmBtn) {
        if (cita.estado === 'CONFIRMADA') {
          modalConfirmBtn.textContent = 'Marcar Pendiente';
          modalConfirmBtn.classList.replace('bg-emerald-500', 'bg-orange-500');
          modalConfirmBtn.classList.replace('hover:bg-emerald-400', 'hover:bg-orange-400');
          modalConfirmBtn.classList.replace('shadow-emerald-500/20', 'shadow-orange-500/20');
        } else {
          modalConfirmBtn.textContent = 'Marcar Confirmada';
          modalConfirmBtn.classList.replace('bg-orange-500', 'bg-emerald-500');
          modalConfirmBtn.classList.replace('hover:bg-orange-400', 'hover:bg-emerald-400');
          modalConfirmBtn.classList.replace('shadow-orange-500/20', 'shadow-emerald-500/20');
        }
      }

      modal.classList.remove('opacity-0', 'pointer-events-none');
      modalContent.classList.remove('scale-95');
    };

    const closeModal = () => {
      modal.classList.add('opacity-0', 'pointer-events-none');
      modalContent.classList.add('scale-95');
      currentSelectedCitaId = null;
    };

    modalOverlay?.addEventListener('click', closeModal);
    modalClose?.addEventListener('click', closeModal);

    if (modalConfirmBtn) {
      modalConfirmBtn.addEventListener('click', async () => {
        if (!currentSelectedCitaId) return;
        
        const cita = appointments.find(c => c.id === currentSelectedCitaId);
        if (!cita) return;

        const newStatus = cita.estado === 'CONFIRMADA' ? 'CREADA' : 'CONFIRMADA';
        
        try {
          const res = await fetch(`${API_URL}/admin/citas/${cita.id}/estado`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authSystem.getToken()}`
            },
            body: JSON.stringify({ estado: newStatus })
          });
          
          if (res.ok) {
            toast?.({ title: "Actualizado", message: `Cita marcada como ${newStatus}.` });
            cita.estado = newStatus;
            closeModal();
            applyFilters(); // Re-renderizar
          } else {
            toast?.({ title: "Error", message: "No se pudo actualizar el estado." });
          }
        } catch (err) {
          console.error(err);
          toast?.({ title: "Error", message: "Fallo de conexión." });
        }
      });
    }

    // --- Carga de Datos (Mock + Fetch real si existe) ---
    const loadAppointments = async () => {
      if (loadingState) loadingState.classList.remove('hidden');
      if (emptyState) emptyState.classList.add('hidden');

      try {
        const token = authSystem.getToken();
        const res = await fetch(`${API_URL}/admin/citas`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          appointments = await res.json();
        } else {
          throw new Error("No hay endpoint de admin o falló");
        }
      } catch (err) {
        // Fallback: Datos simulados para demostrar la UI de lista
        console.log("Cargando datos simulados para la lista admin...");
        const today = new Date();
        const y = today.getFullYear();
        const m = today.getMonth();
        const d = today.getDate();
        
        appointments = [
          { id: 1, servicio: 'Masaje Relajante', habitacion: 'Ninguna', fecha: new Date(y, m, d+1, 10, 30).toISOString(), estado: 'CONFIRMADA', usuario_id: 101, usuario_nombre: 'Ana Gómez', usuario_correo: 'ana@ejemplo.com' },
          { id: 2, servicio: 'Cena Romántica', habitacion: 'Suite Amanecer', fecha: new Date(y, m, d+2, 19, 0).toISOString(), estado: 'CREADA', usuario_id: 102, usuario_nombre: 'Carlos Ruiz', usuario_correo: 'carlos@ejemplo.com' },
          { id: 3, servicio: 'Recorrido Ecológico', habitacion: 'Cabaña Raíz', fecha: new Date(y, m, d-1, 8, 0).toISOString(), estado: 'CONFIRMADA', usuario_id: 103, usuario_nombre: 'María Paz', usuario_correo: 'maria@ejemplo.com' },
          { id: 4, servicio: 'Ninguno', habitacion: 'Finca Familiar', fecha: new Date(y, m, d+5, 14, 0).toISOString(), estado: 'CREADA', usuario_id: 104, usuario_nombre: 'Luis Fernando', usuario_correo: 'luis@ejemplo.com' },
          { id: 5, servicio: 'Masaje Relajante, Cena Romántica', habitacion: 'Cúpula Estelar', fecha: new Date(y, m, d+7, 15, 0).toISOString(), estado: 'CONFIRMADA', usuario_id: 105, usuario_nombre: 'Diana Silva', usuario_correo: 'diana@ejemplo.com' },
        ];
      } finally {
        if (loadingState) loadingState.classList.add('hidden');
        applyFilters();
      }
    };

    // --- Renderizado de la Lista ---
    const renderList = () => {
      // Limpiar los elementos existentes
      const items = qsa('.admin-list-item', listContainer);
      items.forEach(item => item.remove());

      if (filteredAppointments.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        return;
      }

      if (emptyState) emptyState.classList.add('hidden');

      // Ordenar por fecha (más recientes primero)
      filteredAppointments.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

      filteredAppointments.forEach(cita => {
        const d = new Date(cita.fecha);
        const dateStr = d.toLocaleDateString('es-CO', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
        
        const isConfirmed = cita.estado === 'CONFIRMADA';
        const statusClass = isConfirmed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400';
        
        const clientName = cita.usuario_nombre || (cita.usuario_id ? `Usuario #${cita.usuario_id}` : 'Cliente Anónimo');
        const servicesStr = cita.servicio && cita.servicio !== 'Ninguno' ? cita.servicio : '<span class="text-slate-500 italic">No especificado</span>';
        const roomsStr = cita.habitacion && cita.habitacion !== 'Ninguna' ? cita.habitacion : '<span class="text-slate-500 italic">No especificada</span>';

        const row = document.createElement('div');
        row.className = 'admin-list-item flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 p-4 md:items-center border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer';
        
        // Estructura adaptativa: Tarjeta en móvil, Fila en Desktop
        row.innerHTML = `
          <div class="col-span-2">
            <div class="text-white font-bold">${dateStr}</div>
            <div class="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              ${timeStr}
            </div>
          </div>
          
          <div class="col-span-3 mt-2 md:mt-0">
            <div class="text-xs font-semibold text-slate-500 uppercase md:hidden mb-1">Cliente</div>
            <div class="text-slate-200 font-medium truncate" title="${clientName}">${clientName}</div>
          </div>
          
          <div class="col-span-3 mt-2 md:mt-0">
            <div class="text-xs font-semibold text-slate-500 uppercase md:hidden mb-1">Servicios</div>
            <div class="text-sm text-slate-300 line-clamp-2" title="${cita.servicio}">${servicesStr}</div>
          </div>
          
          <div class="col-span-2 mt-2 md:mt-0">
            <div class="text-xs font-semibold text-slate-500 uppercase md:hidden mb-1">Habitaciones</div>
            <div class="text-sm text-slate-300 line-clamp-2" title="${cita.habitacion}">${roomsStr}</div>
          </div>
          
          <div class="col-span-2 flex justify-between md:justify-end items-center mt-3 md:mt-0">
            <span class="px-2 py-1 rounded-md text-xs font-bold ${statusClass}">
              ${cita.estado.toUpperCase()}
            </span>
            <button class="md:hidden text-slate-400 hover:text-white p-2" aria-label="Ver detalles">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </button>
          </div>
        `;
        
        row.addEventListener('click', () => openModal(cita));
        listContainer.appendChild(row);
      });
    };

    // --- Filtros y Búsqueda ---
    const applyFilters = () => {
      if (!filterForm) return;
      const formData = new FormData(filterForm);
      const activeStatuses = formData.getAll('status');
      const activeRoomFilters = formData.getAll('has_room'); 
      const searchTerm = (searchInput?.value || '').toLowerCase();

      filteredAppointments = appointments.filter(cita => {
        // Filtro 1: Estado
        const matchesStatus = activeStatuses.includes(cita.estado);
        
        // Filtro 2: Tiene o no tiene habitación
        let matchesRoom = false;
        const hasRoom = cita.habitacion && cita.habitacion.trim() !== '' && cita.habitacion !== 'Ninguna';
        
        if (activeRoomFilters.includes('yes') && activeRoomFilters.includes('no')) {
          matchesRoom = true;
        } else if (activeRoomFilters.includes('yes')) {
          matchesRoom = hasRoom;
        } else if (activeRoomFilters.includes('no')) {
          matchesRoom = !hasRoom;
        } else {
          matchesRoom = false;
        }

        // Filtro 3: Búsqueda por texto (nombre, id)
        const clientName = (cita.usuario_nombre || '').toLowerCase();
        const idStr = String(cita.usuario_id || '');
        const matchesSearch = !searchTerm || clientName.includes(searchTerm) || idStr.includes(searchTerm);

        return matchesStatus && matchesRoom && matchesSearch;
      });

      if (totalCount) totalCount.textContent = filteredAppointments.length;
      renderList();
    };

    filterForm?.addEventListener('change', applyFilters);
    searchInput?.addEventListener('input', applyFilters);

    // Inicializar
    loadAppointments();

  })();

})();
