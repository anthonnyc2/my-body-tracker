"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getExerciseCatalog, getExerciseFilterOptions } from "@/actions/routine"

export type ExerciseSummary = {
  id: string
  name: string
  category: string
  equipment: string | null
  targetMuscle: string | null
  thumbnailUrl: string | null
  gifUrl: string | null
}

interface ExercisePickerProps {
  onSelect: (exercise: ExerciseSummary) => void
}

const ALL_VALUE = "__all__"

export function ExercisePicker({ onSelect }: ExercisePickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [category, setCategory] = useState(ALL_VALUE)
  const [equipment, setEquipment] = useState(ALL_VALUE)
  const [targetMuscle, setTargetMuscle] = useState(ALL_VALUE)
  const [previewExercise, setPreviewExercise] = useState<ExerciseSummary | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timeout)
  }, [search])

  const { data: filterOptions } = useQuery({
    queryKey: ["exerciseFilterOptions"],
    queryFn: () => getExerciseFilterOptions(),
    enabled: open,
  })

  const { data, isLoading } = useQuery({
    queryKey: ["exerciseCatalog", debouncedSearch, category, equipment, targetMuscle],
    queryFn: () =>
      getExerciseCatalog({
        search: debouncedSearch || undefined,
        category: category === ALL_VALUE ? undefined : category,
        equipment: equipment === ALL_VALUE ? undefined : equipment,
        targetMuscle: targetMuscle === ALL_VALUE ? undefined : targetMuscle,
        pageSize: 50,
      }),
    enabled: open,
  })

  function handleSelect(exercise: ExerciseSummary) {
    onSelect(exercise)
    setOpen(false)
    setSearch("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button type="button" variant="outline" size="sm" />}>
        <Plus className="mr-2 h-4 w-4" /> Agregar ejercicio
      </PopoverTrigger>
      <PopoverContent className="w-[32rem] p-3" align="start">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ejercicio..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <Select value={category} onValueChange={(val) => setCategory(val ?? ALL_VALUE)}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todas</SelectItem>
                {filterOptions?.categories.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={equipment} onValueChange={(val) => setEquipment(val ?? ALL_VALUE)}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="Equipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                {filterOptions?.equipment.map((e) => (
                  <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={targetMuscle} onValueChange={(val) => setTargetMuscle(val ?? ALL_VALUE)}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="Músculo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>Todos</SelectItem>
                {filterOptions?.targetMuscles.map((m) => (
                  <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <ScrollArea className="h-72 flex-1 rounded-md border">
              <div className="divide-y">
                {isLoading && (
                  <p className="p-4 text-sm text-muted-foreground text-center">Buscando...</p>
                )}
                {!isLoading && data?.exercises.length === 0 && (
                  <p className="p-4 text-sm text-muted-foreground text-center">Sin resultados</p>
                )}
                {data?.exercises.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => handleSelect(exercise)}
                    onMouseEnter={() => setPreviewExercise(exercise)}
                    onFocus={() => setPreviewExercise(exercise)}
                    className="w-full flex items-center gap-3 p-2 text-left hover:bg-muted/50 transition-colors"
                  >
                    {exercise.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={exercise.thumbnailUrl}
                        alt=""
                        loading="lazy"
                        className="h-10 w-10 rounded-md object-cover shrink-0 bg-muted"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-muted shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate capitalize">{exercise.name}</p>
                      <p className="text-xs text-muted-foreground truncate capitalize">
                        {exercise.category}
                        {exercise.equipment ? ` • ${exercise.equipment}` : ""}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>

            <div className="w-32 shrink-0 rounded-md border p-2 flex flex-col items-center justify-center gap-2 text-center">
              {previewExercise ? (
                <>
                  {(previewExercise.gifUrl || previewExercise.thumbnailUrl) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={previewExercise.id}
                      src={previewExercise.gifUrl || previewExercise.thumbnailUrl || undefined}
                      alt={previewExercise.name}
                      className="h-24 w-24 rounded-md object-cover bg-muted"
                    />
                  )}
                  <p className="text-xs font-medium capitalize line-clamp-2">{previewExercise.name}</p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Pasa el cursor sobre un ejercicio para ver la animación
                </p>
              )}
            </div>
          </div>
          {data && data.total > data.exercises.length && (
            <p className="text-xs text-muted-foreground text-center">
              Mostrando {data.exercises.length} de {data.total} — refina la búsqueda para más resultados
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
