#include <stdint.h>
#include <functional>
#include "stm32f10x_tim.h"
#include "stm32f10x_rcc.h"
#include "misc.h"
#include "ITimerService.h"
#include "Stm32F10xTimerService.h"

namespace Stm32
{
	Stm32F10xTimerService *MainTimerService;
	extern "C" 
	{
		void TIM2_IRQHandler(void)
		{
			MainTimerService->Interrupt();
		}
	}

	Stm32F10xTimerService::Stm32F10xTimerService()
	{	
		TIM_TimeBaseInitTypeDef timeBaseInit;
		TIM_TimeBaseStructInit(&timeBaseInit);
	
		//base Init
		//each tick = 10us
		timeBaseInit.TIM_Prescaler = 144;
		timeBaseInit.TIM_CounterMode = TIM_CounterMode_Up;
		timeBaseInit.TIM_Period = 65535;
		timeBaseInit.TIM_ClockDivision = 0;
		timeBaseInit.TIM_RepetitionCounter = 0;
		RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM2, ENABLE);
		TIM_TimeBaseInit(TIM2, &timeBaseInit);
		TIM_Cmd(TIM2, ENABLE);
	
		/* Enable the timer global Interrupt */
		NVIC_InitTypeDef   NVIC_InitStructure;
		NVIC_InitStructure.NVIC_IRQChannel = TIM2_IRQn;
		NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 0;
		NVIC_InitStructure.NVIC_IRQChannelSubPriority = 0;
		NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
		NVIC_Init(&NVIC_InitStructure);
	
		TIM_OCInitTypeDef oCInit;
		TIM_OCStructInit(&oCInit);
	
		oCInit.TIM_OCMode = TIM_OCMode_Active;
		oCInit.TIM_Pulse = 0x0000;
		TIM_OC1Init(TIM2, &oCInit);
	
		TIM_ClearITPendingBit(TIM2, TIM_IT_CC1 | TIM_IT_Update);
		TIM_ITConfig(TIM2, TIM_IT_Update, ENABLE);
		TIM_ITConfig(TIM2, TIM_IT_CC1, ENABLE);
		
		MainTimerService = this;
	}

	unsigned int Stm32F10xTimerService::GetTick()
	{
		return _tick | TIM_GetCounter(TIM2);
	}

	void Stm32F10xTimerService::ScheduleCallBack(unsigned int tick)
	{
		//1 tick of overhead
		tick--;
		unsigned int counter = _tick | TIM_GetCounter(TIM2);
		if (_tick == (tick & 0xFFFF0000))
		{
			if (tick <= counter)
			{
				ReturnCallBack();
			}
			else
			{
				_futureTock = false;
				_futureTick = true;
				TIM_SetCompare1(TIM2, tick & 0xFFFF);
			}	
		}
		else if ((tick < counter && (counter - tick <= 2147483648)) || (tick > counter && (tick - counter > 2147483648)))
		{
			ReturnCallBack();
		}
		else
		{
			_futureTock = true;
			_futureTick = false;
			_callTick = tick;
		}
	}

	void Stm32F10xTimerService::ReturnCallBack(void)
	{
		_futureTick = false;
		_futureTock = false;
		ITimerService::ReturnCallBack();
	}
	
	void Stm32F10xTimerService::Interrupt(void)
	{
		if (TIM_GetITStatus(TIM2, TIM_IT_CC1) != RESET) {
			if (_futureTick)
			{
				ReturnCallBack();
			}
			TIM_ClearITPendingBit(TIM2, TIM_IT_CC1);
		}
		if (TIM_GetITStatus(TIM2, TIM_IT_Update) != RESET) {
			_tick += 0x00010000;	
			if (_futureTock)
			{
				ScheduleCallBack(_callTick);
			}
			TIM_ClearITPendingBit(TIM2, TIM_IT_Update);
		}
	}

	unsigned int Stm32F10xTimerService::GetTicksPerSecond()
	{
		return 500000;
	}
}