import React, { useRef, useEffect } from 'react';

const IrisBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    class Particle {
      x: number;
      y: number;
      radius: number;
      color: string;
      theta: number;
      speed: number;
      distance: number;

      constructor(x: number, y: number, radius: number, color: string, distance: number) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.theta = Math.random() * Math.PI * 2;
        this.speed = 0.005 + Math.random() * 0.005;
        this.distance = distance;
      }

      draw(context: CanvasRenderingContext2D, centerX: number, centerY: number) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = this.color;
        context.fill();
      }

      update(centerX: number, centerY: number) {
        this.theta += this.speed;
        this.x = centerX + this.distance * Math.cos(this.theta);
        this.y = centerY + this.distance * Math.sin(this.theta);
      }
    }

    let particles: Particle[] = [];
    
    const init = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        const particleCount = 50;
        const centerX = canvas.width / 2;
        const baseRadius = Math.min(canvas.width, canvas.height) * 0.4;

        for (let i = 0; i < particleCount; i++) {
            const radius = Math.random() * 1.5 + 0.5;
            const distance = baseRadius * 0.5 + Math.random() * (baseRadius * 0.6);
            particles.push(new Particle(centerX, canvas.height / 2, radius, '#22d3ee', distance));
        }
    }


    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const outerRadius = Math.min(canvas.width, canvas.height) * 0.4;
      
      const irisPulse = Math.sin(time * 0.6) * 1.5; // A subtle pulse for the iris
      const irisRadius = (outerRadius * 0.95) + irisPulse; // Apply the pulse

      const pupilBaseRadius = irisRadius * 0.25;

      // Pulsing Pupil
      const pupilPulse = Math.sin(time * 0.5) * 2 + 2;
      const pupilRadius = pupilBaseRadius + pupilPulse;

      // Draw floating particles
      particles.forEach(p => {
        p.update(centerX, centerY);
        p.draw(ctx, centerX, centerY);
      });
      
      // Pulsing outer ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(34, 211, 238, ${0.5 + Math.sin(time * 0.7) * 0.2})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Iris Radial Gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, pupilRadius, centerX, centerY, irisRadius);
      gradient.addColorStop(0, '#22d3ee'); 
      gradient.addColorStop(0.5, '#0891b2'); 
      gradient.addColorStop(1, '#0e2940'); 
      ctx.beginPath();
      ctx.arc(centerX, centerY, irisRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Radial Lines
      const lineCount = 60;
      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2;
        const startX = centerX + pupilRadius * Math.cos(angle);
        const startY = centerY + pupilRadius * Math.sin(angle);
        const endX = centerX + irisRadius * Math.cos(angle);
        const endY = centerY + irisRadius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'rgba(14, 116, 144, 0.4)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Pupil
      ctx.beginPath();
      ctx.arc(centerX, centerY, pupilRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#020617';
      ctx.fill();

      // Pupil Highlight
      ctx.beginPath();
      const highlightX = centerX - pupilRadius * 0.2;
      const highlightY = centerY - pupilRadius * 0.2;
      ctx.arc(highlightX, highlightY, pupilRadius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fill();
    };

    const animate = () => {
      time += 0.01;
      draw();
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => {
        init();
    }

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-30" />;
};

export default IrisBackground;