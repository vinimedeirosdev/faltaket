import { Camera, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/misc'
import { Modal } from '@/components/ui/modal'
import { prepararFotoPerfil } from '@/lib/imagem'
import { atualizarFoto } from '../auth/api'

const avisarErro = (e: unknown) => {
  console.error(e)
  toast.error('Não foi possível salvar a foto. Tente de novo.')
}

/** Avatar grande do Perfil: toque para trocar ou remover a foto. */
export function FotoPerfil({ nome, foto }: { nome: string; foto?: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [aberto, setAberto] = useState(false)
  const [previa, setPrevia] = useState<string | null>(null)
  const [processando, setProcessando] = useState(false)

  function fechar() {
    setAberto(false)
    setPrevia(null)
  }

  async function onArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = '' // permite escolher o mesmo arquivo de novo
    if (!arquivo) return
    setProcessando(true)
    try {
      setPrevia(await prepararFotoPerfil(arquivo))
      setAberto(true)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível ler essa imagem.')
    } finally {
      setProcessando(false)
    }
  }

  function salvar() {
    if (!previa) return
    atualizarFoto(previa).catch(avisarErro)
    toast.success('Foto atualizada!')
    fechar()
  }

  function remover() {
    atualizarFoto(null).catch(avisarErro)
    toast('Foto removida')
    fechar()
  }

  const escolher = () => inputRef.current?.click()

  return (
    <>
      <button
        type="button"
        onClick={() => (foto ? setAberto(true) : escolher())}
        className="group relative rounded-full"
        aria-label={foto ? 'Alterar foto de perfil' : 'Adicionar foto de perfil'}
      >
        <Avatar nome={nome} foto={foto} className="size-24 text-3xl" />
        <span className="bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 grid size-8 place-items-center rounded-full ring-4 transition-transform group-active:scale-90">
          {processando ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Camera className="size-4" />
          )}
        </span>
      </button>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onArquivo} />

      <Modal
        open={aberto}
        onOpenChange={(o) => !o && fechar()}
        titulo="Foto de perfil"
        descricao={previa ? 'Ficou bom? A foto é recortada no centro.' : undefined}
      >
        <div className="grid gap-5">
          <div className="grid place-items-center py-2">
            <Avatar nome={nome} foto={previa ?? foto} className="size-40 text-5xl" />
          </div>

          {previa ? (
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={escolher}>
                <ImagePlus /> Outra
              </Button>
              <Button onClick={salvar}>Salvar foto</Button>
            </div>
          ) : (
            <div className="grid gap-2">
              <Button onClick={escolher}>
                <ImagePlus /> Escolher outra foto
              </Button>
              {foto && (
                <Button variant="ghost" className="text-destructive" onClick={remover}>
                  <Trash2 /> Remover foto
                </Button>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}
