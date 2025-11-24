
"use client"

import * as React from "react"
import { type EmblaCarouselType } from 'embla-carousel'
import useEmblaCarousel from "embla-carousel-react"
import { LoyaltyCard } from "@/components/client/loyalty-card"
import type { ClientCard, Restaurant } from "@/lib/types"
import { cn } from "@/lib/utils"

type PropType = {
  cards: { [id: string]: ClientCard }
  restaurants: { [id: string]: Restaurant }
}

export const CardCarousel: React.FC<PropType> = (props) => {
  const { cards, restaurants } = props
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'center' })
  const [prevBtnDisabled, setPrevBtnDisabled] = React.useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = React.useState(true)
  const [selectedSnap, setSelectedSnap] = React.useState(0)
  const [slidesInView, setSlidesInView] = React.useState<number[]>([])

  const cardIds = Object.keys(cards);

  const updateSlidesInView = React.useCallback((emblaApi: EmblaCarouselType) => {
    if (!emblaApi) return;
    setSlidesInView((slidesInView) => {
      if (slidesInView.length === emblaApi.slidesInView().length) {
        if (slidesInView.every((v, i) => v === emblaApi.slidesInView()[i]))
          return slidesInView
      }
      return emblaApi.slidesInView()
    })
  }, [])

  const onSelect = React.useCallback((emblaApi: EmblaCarouselType) => {
    if (!emblaApi) return;
    setSelectedSnap(emblaApi.selectedScrollSnap())
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [])
  
  React.useEffect(() => {
    if (!emblaApi) return
    onSelect(emblaApi)
    updateSlidesInView(emblaApi)
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    emblaApi.on('slidesInView', updateSlidesInView)
  }, [emblaApi, onSelect, updateSlidesInView])


  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4">
          {cardIds.map((restoId, index) => {
            const restaurant = restaurants[restoId]
            const clientCard = cards[restoId]
            if (!restaurant || !clientCard) return null;
            
            const isSelected = selectedSnap === index
            const isInView = slidesInView.includes(index)

            return (
              <div
                key={restoId}
                className={cn("flex-[0_0_80%] pl-4 embla__slide", {
                  'is-selected': isSelected,
                  'is-prev': selectedSnap > index,
                  'is-next': selectedSnap < index,
                })}
              >
                <LoyaltyCard
                  restaurant={restaurant}
                  clientCard={clientCard}
                />
              </div>
            )
          })}
        </div>
      </div>
       <div className="grid grid-cols-1 items-center pt-4">
        <div className="flex w-full items-center justify-center gap-2">
            {cardIds.map((_, index) => (
                <button
                    key={index}
                    onClick={() => emblaApi?.scrollTo(index)}
                    className={cn(
                        'h-2 w-2 rounded-full bg-gray-300 transition-all duration-300',
                        selectedSnap === index ? 'w-4 bg-primary' : 'hover:bg-gray-400'
                    )}
                />
            ))}
        </div>
      </div>
    </div>
  )
}
