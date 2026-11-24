import { MEDIA_PLACEHOLDER, type Exercise } from "@/data/program";
import { Figure, Leaves } from "./Figure";

export function ExerciseMedia({ exercise, className = "" }: { exercise: Exercise; className?: string }) {
  const isPlaceholder = !exercise.mediaUrl || exercise.mediaUrl === MEDIA_PLACEHOLDER;
  return (
    <div className={`relative overflow-hidden rounded-[28px] bg-gradient-to-b from-soft to-[#e4dafd] ${className}`}>
      {isPlaceholder ? (
        <>
          <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/50" />
          <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-white/40" />
          <Leaves className="absolute bottom-0 left-2 h-24 opacity-90" />
          <Leaves className="absolute bottom-0 right-2 h-20 opacity-90" flip />
          <div className="relative flex h-full items-end justify-center px-4 pb-2">
            <Figure pose={exercise.pose} className="w-full max-w-[300px] animate-float" />
          </div>
          <span className="absolute left-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur">
            Vídeo em breve
          </span>
        </>
      ) : exercise.mediaUrl.endsWith(".gif") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={exercise.mediaUrl} alt={exercise.nome} className="h-full w-full object-cover" />
      ) : (
        <video src={exercise.mediaUrl} autoPlay loop muted playsInline className="h-full w-full object-cover" />
      )}
    </div>
  );
}

/** Miniatura quadrada para listas */
export function ExerciseThumb({ exercise, className = "" }: { exercise: Exercise; className?: string }) {
  return (
    <div className={`flex shrink-0 items-end justify-center overflow-hidden rounded-2xl bg-soft ${className}`}>
      <Figure pose={exercise.pose} className="w-[115%]" />
    </div>
  );
}
