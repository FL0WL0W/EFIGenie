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
		
		switch (timer)
		{
		case 1:
			if (TIM1_Freq_Locked)
				return;
			NVIC->IP[TIM1_UP_IRQn] = 0;
			NVIC->ISER[TIM1_UP_IRQn >> 0x05] = 0x01 << (TIM1_UP_IRQn & 0x1F);
			NVIC->IP[TIM1_CC_IRQn] = 0;
			NVIC->ISER[TIM1_CC_IRQn >> 0x05] = 0x01 << (TIM1_CC_IRQn & 0x1F);
			TIM1_Freq_Locked = true;
			TimerService1 = this;
			RCC->APB2ENR |= RCC_APB2Periph_TIM1;
			TIM = TIM1;
		case 2:
			NVIC->IP[TIM2_IRQn] = 0;
			NVIC->ISER[TIM2_IRQn >> 0x05] = 0x01 << (TIM2_IRQn & 0x1F);
			if (TIM2_Freq_Locked)
				return;
			TIM2_Freq_Locked = true;
			TimerService2 = this;
			RCC->APB1ENR |= RCC_APB1Periph_TIM2;
			TIM = TIM2;
		case 3:
			NVIC->IP[TIM3_IRQn] = 0;
			NVIC->ISER[TIM3_IRQn >> 0x05] = 0x01 << (TIM3_IRQn & 0x1F);
			if (TIM3_Freq_Locked)
				return;
			TIM3_Freq_Locked = true;
			TimerService3 = this;
			RCC->APB1ENR |= RCC_APB1Periph_TIM3;
			TIM = TIM3;
		case 4:
			NVIC->IP[TIM4_IRQn] = 0;
			NVIC->ISER[TIM4_IRQn >> 0x05] = 0x01 << (TIM4_IRQn & 0x1F);
			if (TIM4_Freq_Locked)
				return;
			TIM4_Freq_Locked = true;
			TimerService4 = this;
			RCC->APB1ENR |= RCC_APB1Periph_TIM4;
			TIM = TIM4;
		}
		
		//set prescaler
		TIM->PSC = (72 * 1000 * 1000) / ticksPerSecond;
		_ticksPerSecond = (72 * 1000 * 1000) / TIM->PSC;
		
		//set mode
		TIM->CR1 = (TIM->CR1 & ~(TIM_CR1_DIR | TIM_CR1_CMS | TIM_CR1_CKD)) | TIM_CounterMode_Up;
		TIM->ARR = 0xFFFF;
		
		TIM->CNT = 0;
		
		//enable timer
		TIM->CR1 |= TIM_CR1_CEN;
	
		unsigned short TIM_IT;
		
		/* Enable the timer global Interrupt */
		switch (compareRegister)
		{
		case 1:
			TIM_IT = TIM_IT_CC1;
			TIM->CCER &= (uint16_t)(~(uint16_t)TIM_CCER_CC1E);
			TIM->CCMR1 = (TIM->CCMR1 & ~(TIM_CCMR1_OC1M | TIM_CCMR1_CC1S)) | TIM_OCMode_Active;
			if (TIM == TIM1)
				TIM->CR2 = (TIM->CR2 & ~(TIM_CR2_OIS1)) | TIM_OCIdleState_Reset;
			TIM->CCR1 = 0;
			TIM->CCER = (TIM->CCER & ~(TIM_CCER_CC1P)) | TIM_OutputState_Disable | TIM_OCPolarity_High;
			TimerService1 = this;
			break;
		case 2:
			TIM_IT = TIM_IT_CC2;
			TIM->CCER &= (uint16_t)(~(uint16_t)TIM_CCER_CC2E);
			TIM->CCMR1 = (TIM->CCMR1 & ~(TIM_CCMR1_OC2M | TIM_CCMR1_CC2S)) | (TIM_OCMode_Active << 8);
			if (TIM == TIM1)
				TIM->CR2 = (TIM->CR2 & ~(TIM_CR2_OIS2)) | (TIM_OCIdleState_Reset << 2);
			TIM->CCR2 = 0;
			TIM->CCER = (TIM->CCER & ~(TIM_CCER_CC2P)) | ((TIM_OutputState_Disable | TIM_OCPolarity_High) << 4);
			TimerService2 = this;
			break;
		case 3:
			TIM_IT = TIM_IT_CC3;
			TIM->CCER &= (uint16_t)(~(uint16_t)TIM_CCER_CC3E);
			TIM->CCMR2 = (TIM->CCMR2 & ~(TIM_CCMR2_OC3M | TIM_CCMR2_CC3S)) | (TIM_OCMode_Active);
			if (TIM == TIM1)
				TIM->CR2 = (TIM->CR2 & ~(TIM_CR2_OIS3)) | (TIM_OCIdleState_Reset << 4);
			TIM->CCR3 = 0;
			TIM->CCER = (TIM->CCER & ~(TIM_CCER_CC3P)) | ((TIM_OutputState_Disable | TIM_OCPolarity_High) << 8);
			TimerService3 = this;
			break;
		case 4:
			TIM_IT = TIM_IT_CC4;
			TIM->CCER &= (uint16_t)(~(uint16_t)TIM_CCER_CC4E);
			TIM->CCMR2 = (TIM->CCMR2 & ~(TIM_CCMR2_OC4M | TIM_CCMR2_CC4S)) | (TIM_OCMode_Active << 8);
			if (TIM == TIM1)
				TIM->CR2 = (TIM->CR2 & ~(TIM_CR2_OIS4)) | (TIM_OCIdleState_Reset << 6);
			TIM->CCR4 = 0;
			TIM->CCER = (TIM->CCER & ~(TIM_CCER_CC4P)) | ((TIM_OutputState_Disable | TIM_OCPolarity_High) << 12);
			TimerService4 = this;
			break;
		}
	
		TIM->SR = ~(TIM_IT | TIM_IT_Update);
		TIM->DIER |= TIM_IT_Update | TIM_IT;
	}

	unsigned int Stm32F103TimerService::GetTick()
	{
		return _tick | TIM->CNT;
	}

	void Stm32F103TimerService::ScheduleCallBack(unsigned int tick)
	{
		//1 tick of overhead
		tick--;
		unsigned int counter = _tick | TIM->CNT;
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
					TIM->CCR1 = tick & 0xFFFF;
					break;
				case 2:
					TIM->CCR2 = tick & 0xFFFF;
					break;
				case 3:
					TIM->CCR3 = tick & 0xFFFF;
					break;
				case 4:
					TIM->CCR4 = tick & 0xFFFF;
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
		
		if (TIM->SR & TIM_IT) {
			if (_futureTick)
			{
				ReturnCallBack();
			}
			TIM->SR = (uint16_t)~TIM_IT;
		}
		if (TIM->SR & TIM_IT_Update) {
			_tick += 0x00010000;	
			if (_futureTock)
			{
				ScheduleCallBack(_callTick);
			}
			TIM->SR = (uint16_t)~TIM_IT_Update;
		}
	}

	unsigned int Stm32F103TimerService::GetTicksPerSecond()
	{
		return _ticksPerSecond;
	}
}