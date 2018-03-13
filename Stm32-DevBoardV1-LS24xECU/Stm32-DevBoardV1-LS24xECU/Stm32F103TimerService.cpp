#include <stdint.h>
#include <functional>
#include "stm32f10x_tim.h"
#include "stm32f10x_rcc.h"
#include "misc.h"
#include "ITimerService.h"
#include "Stm32F103TimerService.h"
#include "TimerLocks.h"

namespace Stm32
{
	Stm32F103TimerService *TimerService1 = 0;
	Stm32F103TimerService *TimerService2 = 0;
	Stm32F103TimerService *TimerService3 = 0;
	Stm32F103TimerService *TimerService4 = 0;
	
	Stm32F103TimerService::Stm32F103TimerService(unsigned char timer, unsigned char compareRegister, unsigned int ticksPerSecond)
	{	
		_compareRegister = compareRegister;
		
		NVIC_InitTypeDef   NVIC_InitStructure;
		switch (timer)
		{
		case 1:
			if (TIM1_Freq_Locked)
				return;
			NVIC_InitStructure.NVIC_IRQChannel = TIM1_UP_IRQn | TIM1_CC_IRQn;
			TIM1_Freq_Locked = true;
			TimerService1 = this;
			RCC_APB1PeriphClockCmd(RCC_APB2Periph_TIM1, ENABLE);
			TIM = TIM1;
		case 2:
			NVIC_InitStructure.NVIC_IRQChannel = TIM2_IRQn;
			if (TIM2_Freq_Locked)
				return;
			TIM2_Freq_Locked = true;
			TimerService2 = this;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM2, ENABLE);
			TIM = TIM2;
		case 3:
			NVIC_InitStructure.NVIC_IRQChannel = TIM3_IRQn;
			if (TIM3_Freq_Locked)
				return;
			TIM3_Freq_Locked = true;
			TimerService3 = this;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);
			TIM = TIM3;
		case 4:
			NVIC_InitStructure.NVIC_IRQChannel = TIM4_IRQn;
			if (TIM4_Freq_Locked)
				return;
			TIM4_Freq_Locked = true;
			TimerService4 = this;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM4, ENABLE);
			TIM = TIM4;
		}
		NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 0;
		NVIC_InitStructure.NVIC_IRQChannelSubPriority = 0;
		NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
		NVIC_Init(&NVIC_InitStructure);
				
		TIM_TimeBaseInitTypeDef timeBaseInit;
		TIM_TimeBaseStructInit(&timeBaseInit);
	
		//base Init
		timeBaseInit.TIM_Prescaler = (72 * 1000 * 1000) / ticksPerSecond;
		_ticksPerSecond = (72 * 1000 * 1000) / timeBaseInit.TIM_Prescaler;
		timeBaseInit.TIM_CounterMode = TIM_CounterMode_Up;
		timeBaseInit.TIM_Period = 65535;
		timeBaseInit.TIM_ClockDivision = 0;
		timeBaseInit.TIM_RepetitionCounter = 0;
		TIM_TimeBaseInit(TIM, &timeBaseInit);
		TIM_Cmd(TIM, ENABLE);
	
		/* Enable the timer global Interrupt */
		switch (compareRegister)
		{
		case 1:
			TIM_IT_CC = TIM_IT_CC1;
		case 2 :
			TIM_IT_CC = TIM_IT_CC2;
		case 3 :
			TIM_IT_CC = TIM_IT_CC3;
		case 4 :
			TIM_IT_CC = TIM_IT_CC4;
		}
	
		TIM_OCInitTypeDef oCInit;
		TIM_OCStructInit(&oCInit);
	
		oCInit.TIM_OCMode = TIM_OCMode_Active;
		oCInit.TIM_Pulse = 0x0000;
		TIM_OC1Init(TIM, &oCInit);
	
		TIM_ClearITPendingBit(TIM, TIM_IT_CC | TIM_IT_Update);
		TIM_ITConfig(TIM, TIM_IT_Update, ENABLE);
		TIM_ITConfig(TIM, TIM_IT_CC, ENABLE);
		
		TimerService1 = this;
	}

	unsigned int Stm32F103TimerService::GetTick()
	{
		return _tick | TIM_GetCounter(TIM);
	}

	void Stm32F103TimerService::ScheduleCallBack(unsigned int tick)
	{
		//1 tick of overhead
		tick--;
		unsigned int counter = _tick | TIM_GetCounter(TIM);
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
				switch (_compareRegister)
				{
				case 1:
					TIM_SetCompare1(TIM, tick & 0xFFFF);
					break;
				case 2:
					TIM_SetCompare2(TIM, tick & 0xFFFF);
					break;
				case 3:
					TIM_SetCompare3(TIM, tick & 0xFFFF);
					break;
				case 4:
					TIM_SetCompare4(TIM, tick & 0xFFFF);
					break;
				}
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

	void Stm32F103TimerService::ReturnCallBack(void)
	{
		_futureTick = false;
		_futureTock = false;
		ITimerService::ReturnCallBack();
	}
	
	void Stm32F103TimerService::Interrupt(void)
	{
		unsigned short TIM_IT;
		switch (_compareRegister)
		{
		case 1:
			TIM_IT = TIM_IT_CC1;
			break;
		case 2:
			TIM_IT = TIM_IT_CC2;
			break;
		case 3:
			TIM_IT = TIM_IT_CC3;
			break;
		case 4:
			TIM_IT = TIM_IT_CC4;
			break;
		}
		if (TIM_GetITStatus(TIM, TIM_IT) != RESET) {
			if (_futureTick)
			{
				ReturnCallBack();
			}
			TIM_ClearITPendingBit(TIM, TIM_IT);
		}
		if (TIM_GetITStatus(TIM, TIM_IT_Update) != RESET) {
			_tick += 0x00010000;	
			if (_futureTock)
			{
				ScheduleCallBack(_callTick);
			}
			TIM_ClearITPendingBit(TIM, TIM_IT_Update);
		}
	}

	unsigned int Stm32F103TimerService::GetTicksPerSecond()
	{
		return _ticksPerSecond;
	}
}