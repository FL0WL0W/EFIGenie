#include "TimerLocks.h"

bool TIM1_Freq_Locked = false;
bool TIM2_Freq_Locked = false;
bool TIM3_Freq_Locked = false;
bool TIM4_Freq_Locked = false;
bool TIM1_Input = false;
bool TIM2_Input = false;
bool TIM3_Input = false;
bool TIM4_Input = false;

#include "PinDirection.h"
#include "IPwmService.h"
#include "Stm32F103PwmService.h"
#include <stm32f1xx_hal_dma.h>
#include "stm32f1xx_hal_tim.h"
#include "ITimerService.h"
#include "Stm32F103TimerService.h"

namespace Stm32
{
	extern "C" 
	{
		void TIM1_UP_IRQHandler(void)
		{
			if (TimerService1 != 0)
				TimerService1->Interrupt();
		}
		void TIM1_CC_IRQHandler(void)
		{
			if (TimerService1 != 0)
				TimerService1->Interrupt();
			if (PwmService != 0)
				PwmService->InterruptTim1();
		}
		void TIM2_IRQHandler(void)
		{
			if (TimerService2 != 0)
				TimerService2->Interrupt();
			if (PwmService != 0)
				PwmService->InterruptTim2();
		}
		void TIM3_IRQHandler(void)
		{
			if (TimerService3 != 0)
				TimerService3->Interrupt();
			if (PwmService != 0)
				PwmService->InterruptTim3();
		}
		void TIM4_IRQHandler(void)
		{
			if (TimerService4 != 0)
				TimerService4->Interrupt();
			if (PwmService != 0)
				PwmService->InterruptTim4();
		}
	}
}