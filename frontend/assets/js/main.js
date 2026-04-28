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
})();
