import * as THREE from 'three';

/* ============================================================
   ECOSACHET — Three.js 3D Scenes (TypeScript)
   - HeroScene:        Floating 3D sachet with mouse parallax
   - LayerScene:        Exploded layer breakdown
   - DegradationScene:  Dissolve shader + particles
   ============================================================ */

interface Vec2 { x: number; y: number; }
interface Vec3 { x: number; y: number; z: number; }

interface EcoScenesMap {
    hero?: HeroScene;
    layers?: LayerScene;
    degradation?: DegradationScene;
}

declare global {
    interface Window {
        EcoScenes: EcoScenesMap;
    }
}

// ─── HERO SCENE ──────────────────────────────────────────────
class HeroScene {
    private container: HTMLElement;
    private mouse: Vec2;
    private isHovered: boolean;
    private clock: THREE.Clock;
    private disposed: boolean;
    private renderer!: THREE.WebGLRenderer;
    private camera!: THREE.PerspectiveCamera;
    private scene!: THREE.Scene;
    private sachet!: THREE.Mesh;
    private edgeLine!: THREE.LineSegments;
    private group!: THREE.Group;
    constructor(container: HTMLElement) {
        this.container = container;
        this.mouse = { x: 0, y: 0 };
        this.isHovered = false;
        this.clock = new THREE.Clock();
        this.disposed = false;

        this.init();
        this.createScene();
        this.animate();
        this.bindEvents();
    }

    private init(): void {
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(40, this.container.clientWidth / this.container.clientHeight, 0.1, 100);
        this.camera.position.set(0, 0, 5);

        this.scene = new THREE.Scene();
    }

    private createScene(): void {
        this.scene.add(new THREE.AmbientLight(0x404040, 2));

        const key = new THREE.DirectionalLight(0xffffff, 3);
        key.position.set(3, 4, 5);
        this.scene.add(key);

        const fill = new THREE.DirectionalLight(0x52B788, 1);
        fill.position.set(-3, 2, 3);
        this.scene.add(fill);

        const rim = new THREE.PointLight(0x74C69D, 2, 10);
        rim.position.set(0, -2, 3);
        this.scene.add(rim);

        this.createSachet();
    }

    /* Build sachet geometry + texture */
    private createSachet(): void {
        const w = 1.2, h = 1.6, r = 0.12;
        const shape = new THREE.Shape();
        shape.moveTo(-w / 2 + r, -h / 2);
        shape.lineTo(w / 2 - r, -h / 2);
        shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
        shape.lineTo(w / 2, h / 2 - r);
        shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
        shape.lineTo(-w / 2 + r, h / 2);
        shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
        shape.lineTo(-w / 2, -h / 2 + r);
        shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: 0.18, bevelEnabled: true,
            bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 4
        });
        geo.center();

        const mat = new THREE.MeshPhysicalMaterial({
            map: this.createKraftTexture(),
            roughness: 0.75, metalness: 0.0,
            clearcoat: 0.1, clearcoatRoughness: 0.8,
            side: THREE.DoubleSide
        });

        this.sachet = new THREE.Mesh(geo, mat);

        // Edge highlight
        this.edgeLine = new THREE.LineSegments(
            new THREE.EdgesGeometry(geo, 15),
            new THREE.LineBasicMaterial({ color: 0x52B788, transparent: true, opacity: 0 })
        );
        this.sachet.add(this.edgeLine);

        this.group = new THREE.Group();
        this.group.add(this.sachet);
        this.scene.add(this.group);
    }

    /* Procedural kraft-paper canvas texture */
    private createKraftTexture(): THREE.CanvasTexture {
        const c = document.createElement('canvas');
        c.width = 512; c.height = 680;
        const ctx = c.getContext('2d')!;

        // Base
        ctx.fillStyle = '#C4A374';
        ctx.fillRect(0, 0, 512, 680);

        // Grain noise
        const id = ctx.getImageData(0, 0, 512, 680);
        for (let i = 0; i < id.data.length; i += 4) {
            const n = (Math.random() - 0.5) * 25;
            id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n;
        }
        ctx.putImageData(id, 0, 0);

        // Fiber lines
        ctx.save(); ctx.globalAlpha = 0.08; ctx.strokeStyle = '#8B7355'; ctx.lineWidth = 0.5;
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 512, y = Math.random() * 680, a = Math.random() * Math.PI, l = 20 + Math.random() * 60;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); ctx.stroke();
        }
        ctx.restore();

        // White label
        const lw = 300, lh = 200, lx = 106, ly = 180, lr = 12;
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.beginPath();
        ctx.moveTo(lx + lr, ly);
        ctx.lineTo(lx + lw - lr, ly); ctx.quadraticCurveTo(lx + lw, ly, lx + lw, ly + lr);
        ctx.lineTo(lx + lw, ly + lh - lr); ctx.quadraticCurveTo(lx + lw, ly + lh, lx + lw - lr, ly + lh);
        ctx.lineTo(lx + lr, ly + lh); ctx.quadraticCurveTo(lx, ly + lh, lx, ly + lh - lr);
        ctx.lineTo(lx, ly + lr); ctx.quadraticCurveTo(lx, ly, lx + lr, ly);
        ctx.fill();

        // Leaf
        ctx.save(); ctx.translate(256, ly + 50); ctx.fillStyle = '#2D6A4F';
        ctx.beginPath();
        ctx.moveTo(0, -18); ctx.quadraticCurveTo(15, -5, 15, 8);
        ctx.quadraticCurveTo(15, 18, 0, 20); ctx.quadraticCurveTo(-15, 18, -15, 8);
        ctx.quadraticCurveTo(-15, -5, 0, -18); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(0, 14);
        ctx.moveTo(-6, 2); ctx.lineTo(0, 6); ctx.moveTo(6, -2); ctx.lineTo(0, 2); ctx.stroke();
        ctx.restore();

        // Branding
        ctx.fillStyle = '#1B4332'; ctx.font = 'bold 36px Arial,sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('EcoSachet', 256, ly + 105);
        ctx.fillStyle = '#40916C'; ctx.font = '14px Arial,sans-serif';
        ctx.fillText('100% Biodegradable', 256, ly + 130);
        ctx.fillText('& Plant-Based', 256, ly + 148);

        // Green bar
        ctx.fillStyle = '#2D6A4F'; ctx.fillRect(0, 520, 512, 50);
        ctx.fillStyle = '#E8F5E9'; ctx.font = 'bold 14px Arial,sans-serif';
        ctx.fillText('♻  BIODEGRADABLE PACKAGING  ♻', 256, 550);

        // Seal
        ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(0, 45, 512, 3); ctx.fillRect(0, 52, 512, 2);

        const tex = new THREE.CanvasTexture(c);
        tex.needsUpdate = true;
        return tex;
    }

    private animate(): void {
        if (this.disposed) return;
        requestAnimationFrame(() => this.animate());
        const t = this.clock.getElapsedTime();

        if (this.group) {
            // Float
            this.group.position.y = Math.sin(t * 0.8) * 0.08;
            this.group.position.x = Math.sin(t * 0.5) * 0.03;

            // Rotate (auto + mouse)
            const ty = t * 0.3 + this.mouse.x * 0.5;
            const tx = this.mouse.y * 0.3;
            this.group.rotation.y += (ty - this.group.rotation.y) * 0.02;
            this.group.rotation.x += (tx - this.group.rotation.x) * 0.05;

            // Hover scale
            const ts = this.isHovered ? 1.08 : 1.0;
            const cs = this.group.scale.x;
            this.group.scale.setScalar(cs + (ts - cs) * 0.1);

            // Edge glow
            if (this.edgeLine) {
                const to = this.isHovered ? 0.6 : 0;
                (this.edgeLine.material as THREE.LineBasicMaterial).opacity += (to - (this.edgeLine.material as THREE.LineBasicMaterial).opacity) * 0.1;
            }
        }
        this.renderer.render(this.scene, this.camera);
    }

    private bindEvents(): void {
        this.container.addEventListener('mousemove', (e: MouseEvent) => {
            const r = this.container.getBoundingClientRect();
            this.mouse.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
            this.mouse.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        });
        this.container.addEventListener('mouseenter', () => { this.isHovered = true; });
        this.container.addEventListener('mouseleave', () => { this.isHovered = false; this.mouse.x = this.mouse.y = 0; });
        window.addEventListener('resize', () => this._resize());
    }

    private _resize(): void {
        const w = this.container.clientWidth, h = this.container.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }
}

// ─── LAYER BREAKDOWN SCENE ───────────────────────────────────
class LayerScene {
    private container: HTMLElement;
    private progress: number;
    private targetProgress: number;
    private clock: THREE.Clock;
    private layers: THREE.Mesh[];
    private disposed: boolean;
    private renderer!: THREE.WebGLRenderer;
    private camera!: THREE.PerspectiveCamera;
    private scene!: THREE.Scene;
    private layerGroup!: THREE.Group;
    constructor(container: HTMLElement) {
        this.container = container;
        this.progress = 0;
        this.targetProgress = 0;
        this.clock = new THREE.Clock();
        this.layers = [];
        this.disposed = false;

        this.init();
        this.createScene();
        this.animate();
        this.bindEvents();
    }

    private init(): void {
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(40, this.container.clientWidth / this.container.clientHeight, 0.1, 100);
        this.camera.position.set(2.5, 1.5, 4);
        this.camera.lookAt(0, 0, 0);

        this.scene = new THREE.Scene();
    }

    private createScene(): void {
        this.scene.add(new THREE.AmbientLight(0x404040, 2));
        const d = new THREE.DirectionalLight(0xffffff, 3); d.position.set(3, 4, 5); this.scene.add(d);
        const f = new THREE.DirectionalLight(0x52B788, 1.5); f.position.set(-2, 1, 3); this.scene.add(f);
        this.createLayers();
    }

    private createLayers(): void {
        const w = 1.8, h = 2.2;
        const configs = [
            { color: 0xC4A374, opacity: 0.95, roughness: 0.8, metalness: 0, clearcoat: 0, zBase: 0.12 },
            { color: 0x52B788, opacity: 0.7, roughness: 0.3, metalness: 0.2, clearcoat: 0.3, zBase: 0 },
            { color: 0xFEFAE0, opacity: 0.9, roughness: 0.6, metalness: 0, clearcoat: 0, zBase: -0.12 }
        ];

        this.layerGroup = new THREE.Group();

        configs.forEach((cfg, i) => {
            const shape = this._roundedRect(w, h, 0.1);
            const geo = new THREE.ExtrudeGeometry(shape, {
                depth: 0.04, bevelEnabled: true,
                bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2
            });
            geo.center();

            const mat = new THREE.MeshPhysicalMaterial({
                color: cfg.color, roughness: cfg.roughness, metalness: cfg.metalness,
                transparent: true, opacity: cfg.opacity, side: THREE.DoubleSide, clearcoat: cfg.clearcoat
            });

            const edges = new THREE.LineSegments(
                new THREE.EdgesGeometry(geo, 15),
                new THREE.LineBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.3 })
            );

            const mesh = new THREE.Mesh(geo, mat);
            mesh.add(edges);
            mesh.position.z = cfg.zBase;
            mesh.userData = { baseZ: cfg.zBase, index: i };

            this.layers.push(mesh);
            this.layerGroup.add(mesh);
        });

        this.scene.add(this.layerGroup);
    }

    private _roundedRect(w: number, h: number, r: number): THREE.Shape {
        const s = new THREE.Shape();
        s.moveTo(-w / 2 + r, -h / 2);
        s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
        s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
        s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
        s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
        return s;
    }

    setExplodeProgress(p: number): void { this.targetProgress = Math.max(0, Math.min(1, p)); }

    private animate(): void {
        if (this.disposed) return;
        requestAnimationFrame(() => this.animate());
        const t = this.clock.getElapsedTime();

        this.progress += (this.targetProgress - this.progress) * 0.08;

        const sep = 1.3;
        this.layers.forEach((l, i) => {
            l.position.z = l.userData.baseZ + (i - 1) * sep * this.progress;
            l.rotation.y = this.progress * 0.15 * (i - 1);
        });

        this.layerGroup.rotation.y = Math.sin(t * 0.3) * 0.15 + 0.3;
        this.layerGroup.rotation.x = Math.sin(t * 0.2) * 0.05 + 0.1;

        this.renderer.render(this.scene, this.camera);
    }

    private bindEvents(): void {
        window.addEventListener('resize', () => this._resize());
    }
    private _resize(): void {
        const w = this.container.clientWidth, h = this.container.clientHeight;
        this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }
}

// ─── DEGRADATION SCENE ───────────────────────────────────────
class DegradationScene {
    private container: HTMLElement;
    private progress: number;
    private targetProgress: number;
    private clock: THREE.Clock;
    private disposed: boolean;
    private renderer!: THREE.WebGLRenderer;
    private camera!: THREE.PerspectiveCamera;
    private scene!: THREE.Scene;
    private mat!: THREE.ShaderMaterial;
    private sachet!: THREE.Mesh;
    private particles!: THREE.Points;
    private pVel: Vec3[] = [];
    private pLife!: Float32Array;
    private sprouts: THREE.Mesh[] = [];
    constructor(container: HTMLElement) {
        this.container = container;
        this.progress = 0;
        this.targetProgress = 0;
        this.clock = new THREE.Clock();
        this.disposed = false;

        this.init();
        this.createScene();
        this.animate();
        this.bindEvents();
    }

    private init(): void {
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(40, this.container.clientWidth / this.container.clientHeight, 0.1, 100);
        this.camera.position.set(0, 0.5, 4.5);
        this.camera.lookAt(0, 0, 0);

        this.scene = new THREE.Scene();
    }

    private createScene(): void {
        this.scene.add(new THREE.AmbientLight(0x404040, 2));
        const d = new THREE.DirectionalLight(0xffffff, 2.5); d.position.set(3, 4, 5); this.scene.add(d);
        const g = new THREE.PointLight(0x52B788, 2, 8); g.position.set(-2, 1, 3); this.scene.add(g);

        this.createSachet();
        this.createParticles();
        this.createGround();
    }

    /* Sachet with custom dissolve shader */
    private createSachet(): void {
        const w = 1.2, h = 1.6, r = 0.12;
        const shape = new THREE.Shape();
        shape.moveTo(-w / 2 + r, -h / 2);
        shape.lineTo(w / 2 - r, -h / 2); shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
        shape.lineTo(w / 2, h / 2 - r); shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
        shape.lineTo(-w / 2 + r, h / 2); shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
        shape.lineTo(-w / 2, -h / 2 + r); shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);

        const geo = new THREE.ExtrudeGeometry(shape, {
            depth: 0.15, bevelEnabled: true,
            bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3
        });
        geo.center();

        this.mat = new THREE.ShaderMaterial({
            uniforms: {
                uProgress: { value: 0 },
                uTime: { value: 0 },
                uBaseColor: { value: new THREE.Color(0xC4A374) },
                uDecompColor: { value: new THREE.Color(0x3D2B1F) },
                uEdgeColor: { value: new THREE.Color(0x52B788) }
            },
            vertexShader: /* glsl */`
                varying vec2 vUv;
                varying vec3 vNormal;
                uniform float uProgress, uTime;

                vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
                vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
                vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
                vec4 tis(vec4 r){return 1.79284291400159-.85373472095314*r;}

                float snoise(vec3 v){
                    const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0,.5,1.,2.);
                    vec3 i=floor(v+dot(v,C.yyy)),x0=v-i+dot(i,C.xxx);
                    vec3 g=step(x0.yzx,x0.xyz),l=1.-g;
                    vec3 i1=min(g,l.zxy),i2=max(g,l.zxy);
                    vec3 x1=x0-i1+C.xxx,x2=x0-i2+C.yyy,x3=x0-D.yyy;
                    i=mod289(i);
                    vec4 p=permute(permute(permute(i.z+vec4(0,i1.z,i2.z,1))+i.y+vec4(0,i1.y,i2.y,1))+i.x+vec4(0,i1.x,i2.x,1));
                    float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
                    vec4 j=p-49.*floor(p*ns.z*ns.z);
                    vec4 x_=floor(j*ns.z),y_=floor(j-7.*x_);
                    vec4 x=x_*ns.x+ns.yyyy,y=y_*ns.x+ns.yyyy;
                    vec4 h=1.-abs(x)-abs(y);
                    vec4 b0=vec4(x.xy,y.xy),b1=vec4(x.zw,y.zw);
                    vec4 s0=floor(b0)*2.+1.,s1=floor(b1)*2.+1.;
                    vec4 sh=-step(h,vec4(0));
                    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy,a1=b1.xzyw+s1.xzyw*sh.zzww;
                    vec3 p0=vec3(a0.xy,h.x),p1=vec3(a0.zw,h.y),p2=vec3(a1.xy,h.z),p3=vec3(a1.zw,h.w);
                    vec4 norm=tis(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
                    p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
                    vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
                    m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
                }

                void main(){
                    vUv=uv; vNormal=normal;
                    vec3 pos=position;
                    float def=smoothstep(.3,1.,uProgress)*.3;
                    pos+=normal*snoise(pos*3.+uTime*.3)*def;
                    pos.y-=uProgress*.2*(.5+pos.y);
                    gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.);
                }
            `,
            fragmentShader: /* glsl */`
                uniform float uProgress, uTime;
                uniform vec3 uBaseColor, uDecompColor, uEdgeColor;
                varying vec2 vUv;
                varying vec3 vNormal;

                float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
                float n2d(vec2 p){
                    vec2 i=floor(p),f=fract(p);
                    float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));
                    vec2 u=f*f*(3.-2.*f);
                    return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
                }

                void main(){
                    float noise=n2d(vUv*8.)+n2d(vUv*16.)*.5+n2d(vUv*32.)*.25;
                    noise/=1.75;
                    float edge=.05;
                    float dissolve=smoothstep(uProgress*1.2-edge,uProgress*1.2,noise);
                    if(dissolve<.01)discard;

                    vec3 col=mix(uBaseColor,uDecompColor,uProgress);
                    float eg=smoothstep(uProgress*1.2-edge*3.,uProgress*1.2-edge,noise);
                    col=mix(col,uEdgeColor,(1.-eg)*step(.05,uProgress)*.8);

                    vec3 ld=normalize(vec3(.5,.8,1.));
                    col*=.4+max(dot(vNormal,ld),0.)*.6;

                    gl_FragColor=vec4(col,dissolve);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        this.sachet = new THREE.Mesh(geo, this.mat);
        this.scene.add(this.sachet);
    }

    /* Falling particle debris */
    private createParticles(): void {
        const n = 300;
        const pos = new Float32Array(n * 3);
        this.pVel = [];
        this.pLife = new Float32Array(n);

        for (let i = 0; i < n; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 1.2;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 1.6;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
            this.pVel.push({ x: (Math.random() - 0.5) * 0.02, y: -Math.random() * 0.015 - 0.005, z: (Math.random() - 0.5) * 0.01 });
            this.pLife[i] = Math.random();
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

        this.particles = new THREE.Points(geo, new THREE.PointsMaterial({
            color: 0x8B7355, size: 0.03, transparent: true, opacity: 0, sizeAttenuation: true
        }));
        this.scene.add(this.particles);
    }

    /* Ground + sprouts that grow at high progress */
    private createGround(): void {
        const gnd = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 2),
            new THREE.MeshStandardMaterial({ color: 0x2D1810, roughness: 1, transparent: true, opacity: 0.4 })
        );
        gnd.rotation.x = -Math.PI / 2;
        gnd.position.y = -1.0;
        this.scene.add(gnd);

        this.sprouts = [];
        for (let i = 0; i < 6; i++) {
            const sp = new THREE.Mesh(
                new THREE.ConeGeometry(0.02, 0.15, 4),
                new THREE.MeshStandardMaterial({ color: 0x52B788, transparent: true, opacity: 0 })
            );
            sp.position.set((Math.random() - 0.5) * 2.5, -1.0, (Math.random() - 0.5) * 0.6);
            sp.scale.y = 0;
            this.sprouts.push(sp);
            this.scene.add(sp);
        }
    }

    setProgress(p: number): void { this.targetProgress = Math.max(0, Math.min(1, p)); }

    private animate(): void {
        if (this.disposed) return;
        requestAnimationFrame(() => this.animate());
        const t = this.clock.getElapsedTime();

        this.progress += (this.targetProgress - this.progress) * 0.06;

        // Shader uniforms
        if (this.mat) {
            this.mat.uniforms.uProgress.value = this.progress;
            this.mat.uniforms.uTime.value = t;
        }
        if (this.sachet) this.sachet.rotation.y = Math.sin(t * 0.3) * 0.2;

        // Particles
        if (this.particles) {
            const pa = this.particles.geometry.attributes.position.array as Float32Array;
            (this.particles.material as THREE.PointsMaterial).opacity = this.progress * 0.6;
            for (let i = 0; i < pa.length / 3; i++) {
                if (this.progress > this.pLife[i] * 0.8) {
                    pa[i * 3] += this.pVel[i].x;
                    pa[i * 3 + 1] += this.pVel[i].y;
                    pa[i * 3 + 2] += this.pVel[i].z;
                    if (pa[i * 3 + 1] < -2) {
                        pa[i * 3] = (Math.random() - 0.5) * 1.2;
                        pa[i * 3 + 1] = (Math.random() - 0.5) * 1.6;
                        pa[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
                    }
                }
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }

        // Sprouts
        this.sprouts.forEach((sp: THREE.Mesh, i: number) => {
            const gs: number = 0.4 + i * 0.1;
            const gp: number = Math.max(0, (this.progress - gs) / (1 - gs));
            (sp.material as THREE.MeshStandardMaterial).opacity = gp;
            sp.scale.y = gp;
            sp.position.y = -1.0 + gp * 0.07;
        });

        this.renderer.render(this.scene, this.camera);
    }

    private bindEvents(): void {
        window.addEventListener('resize', () => this._resize());
    }
    private _resize(): void {
        const w = this.container.clientWidth, h = this.container.clientHeight;
        this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }
}

// ─── INIT ────────────────────────────────────────────────────
function isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

function webglOk(): boolean {
    try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl'))); }
    catch (_e) { return false; }
}

window.EcoScenes = {};

function boot(): void {
    if (!webglOk()) return;
    const mobile = isMobile();

    // Hero
    const hc = document.getElementById('hero-3d-container');
    if (hc && !mobile) {
        hc.closest('.hero-visual')?.querySelector('.hero-image-fallback')?.classList.add('hidden-3d');
        window.EcoScenes.hero = new HeroScene(hc);
    }

    // Layers
    const lc = document.getElementById('layer-3d-container');
    if (lc && !mobile) {
        lc.closest('.layers-image')?.querySelector('.layers-fallback')?.classList.add('hidden-3d');
        window.EcoScenes.layers = new LayerScene(lc);
    }

    // Degradation (always — the key feature)
    const dc = document.getElementById('degradation-3d-container');
    if (dc) {
        dc.querySelector('.degradation-fallback')?.classList.add('hidden-3d');
        window.EcoScenes.degradation = new DegradationScene(dc);

        const slider = document.getElementById('degradation-slider');
        const dayEl = document.getElementById('degradation-day');
        const statusEl = document.getElementById('degradation-status');

        if (slider) {
            slider.addEventListener('input', (e: Event) => {
                const target = e.target as HTMLInputElement;
                const d: number = parseInt(target.value);
                window.EcoScenes.degradation!.setProgress(d / 120);
                if (dayEl) dayEl.textContent = d.toString();
                if (statusEl) {
                    statusEl.textContent = d === 0 ? 'Freshly Packaged'
                        : d <= 30 ? 'Beginning to Soften'
                        : d <= 60 ? 'Partial Decomposition'
                        : d <= 90 ? 'Significant Breakdown'
                        : 'Nearly Composted';
                }
            });
        }
    }
}

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
