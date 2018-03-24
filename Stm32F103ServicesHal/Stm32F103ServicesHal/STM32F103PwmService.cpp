#include "PinDirection.h"
#include "IPwmService.h"
#include "misc.h"
#include "Stm32F103PwmService.h"
#include <stm32f1xx_hal_gpio.h>
#include <stm32f1xx_hal_tim.h>
#include <stm32f1xx_hal_rcc.h>
#include <algorithm>
#include <math.h>
#include "TimerLocks.h"

namespace Stm32
{
	Stm32F103PwmService *PwmService = 0;
	
	Stm32F103PwmService::Stm32F103PwmService()
	{
		PwmService = this;
	}
	
	void Stm32F103PwmService::InitPin(unsigned char pin, HardwareAbstraction::PinDirection direction, unsigned short minFrequency)
	{
		if (pin == 0)
			return;
		
		uint16_t TIM_CHANNEL;
		TIM_TypeDef *TIM;
		GPIO_TypeDef *GPIO;
		
		GPIO = GPIO;		
		GPIO_InitTypeDef GPIO_InitStruct;
		
		switch (pin)
		{
		case 1:
			TIM_CHANNEL = TIM_CHANNEL_1;
			TIM = TIM2;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_0;
			RCC->APB1ENR |= RCC_APB1Periph_TIM2;
			break;
		case 2:
			TIM_CHANNEL = TIM_CHANNEL_2;
			TIM = TIM2;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_1;
			RCC->APB1ENR |= RCC_APB1Periph_TIM2;
			break;
		case 3:
			TIM_CHANNEL = TIM_CHANNEL_3;
			TIM = TIM2;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_2;
			RCC->APB1ENR |= RCC_APB1Periph_TIM2;
			break;
		case 4:
			TIM_CHANNEL = TIM_CHANNEL_4;
			TIM = TIM2;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_3;
			RCC->APB1ENR |= RCC_APB1Periph_TIM2;
			break;
		case 7:
			TIM_CHANNEL = TIM_CHANNEL_1;
			TIM = TIM3;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_6;
			RCC->APB1ENR |= RCC_APB1Periph_TIM3;
			break;
		case 8:
			TIM_CHANNEL = TIM_CHANNEL_2;
			TIM = TIM3;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_7;
			RCC->APB1ENR |= RCC_APB1Periph_TIM3;
			break;
		case 9:
			TIM_CHANNEL = TIM_CHANNEL_1;
			TIM = TIM1;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_8;
			RCC->APB2ENR |= RCC_APB2Periph_TIM1;
			break;
		case 10:
			TIM_CHANNEL = TIM_CHANNEL_2;
			TIM = TIM1;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_9;
			RCC->APB2ENR |= RCC_APB2Periph_TIM1;
			break;
		case 11:
			TIM_CHANNEL = TIM_CHANNEL_3;
			TIM = TIM1;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_10;
			RCC->APB2ENR |= RCC_APB2Periph_TIM1;
			break;
		case 12:
			TIM_CHANNEL = TIM_CHANNEL_4;
			TIM = TIM1;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_11;
			RCC->APB2ENR |= RCC_APB2Periph_TIM1;
			break;
		case 17:
			TIM_CHANNEL = TIM_CHANNEL_3;
			TIM = TIM3;
			GPIO = GPIOB;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_0;
			RCC->APB1ENR |= RCC_APB1Periph_TIM3;
			break;
		case 18:
			TIM_CHANNEL = TIM_CHANNEL_4;
			TIM = TIM3;
			GPIO = GPIOB;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_1;
			RCC->APB1ENR |= RCC_APB1Periph_TIM3;
			break;
		case 23:
			TIM_CHANNEL = TIM_CHANNEL_1;
			TIM = TIM4;
			GPIO = GPIOB;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_6;
			RCC->APB1ENR |= RCC_APB1Periph_TIM4;
			break;
		case 24:
			TIM_CHANNEL = TIM_CHANNEL_2;
			TIM = TIM4;
			GPIO = GPIOB;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_7;
			RCC->APB1ENR |= RCC_APB1Periph_TIM4;
			break;
		case 25:
			TIM_CHANNEL = TIM_CHANNEL_3;
			TIM = TIM4;
			GPIO = GPIOB;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_8;
			RCC->APB1ENR |= RCC_APB1Periph_TIM4;
			break;
		case 26:
			TIM_CHANNEL = TIM_CHANNEL_4;
			TIM = TIM4;
			GPIO = GPIOB;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_9;
			RCC->APB1ENR |= RCC_APB1Periph_TIM4;
			break;
		}
				
		if (direction == HardwareAbstraction::Out)
		{
			GPIO_InitStruct.GPIO_Mode = GPIO_Mode_AF_PP;
			GPIO_InitStruct.GPIO_Speed = GPIO_Speed_50MHz;

			GPIO_Init(GPIO, &GPIO_InitStruct);
						
			if (!((TIM == TIM1 && (TIM1_Freq_Locked || TIM1_Input)) || (TIM == TIM2 && (TIM2_Freq_Locked || TIM2_Input)) || (TIM == TIM3 && (TIM3_Freq_Locked || TIM1_Input)) || (TIM == TIM4 && (TIM4_Freq_Locked || TIM4_Input))))
			{
				//set the frequency and mode
				TIM->CR1 = (TIM->CR1 & ~(TIM_CR1_DIR | TIM_CR1_CMS | TIM_CR1_CKD)) | TIM_COUNTERMODE_UP;
				TIM->PSC = std::max((unsigned short)1, (unsigned short)ceil(((72 * 1000 * 1000.0) / 65535) * 1));
				TIM->ARR = (int)ceil(((72 * 1000 * 1000.0) / TIM->PSC) * 1);
			}
			//make sure we are in the right mode
			else if(TIM->CR1 & (~(TIM_CR1_DIR | TIM_CR1_CMS | TIM_CR1_CKD) | TIM_COUNTERMODE_UP))
				return;  //TODO: figure out errors

			switch (TIM_CHANNEL)
			{
			case TIM_CHANNEL_1:
				TIM->CCER &= (uint16_t)(~(uint16_t)TIM_CCER_CC1E);
				TIM->CCMR1 = (TIM->CCMR1 & ~(TIM_CCMR1_OC1M | TIM_CCMR1_CC1S)) | TIM_OCMODE_PWM1;
				if (TIM == TIM1)
					TIM->CR2 = (TIM->CR2 & ~(TIM_CR2_OIS1)) | TIM_OCIDLESTATE_SET;
				TIM->CCR1 = 0;
				TIM->CCER = (TIM->CCER & ~(TIM_CCER_CC1P)) | TIM_OUTPUTSTATE_ENABLE | TIM_OCPOLARITY_HIGH;
				break;
			case TIM_CHANNEL_2:
				TIM->CCER &= (uint16_t)(~(uint16_t)TIM_CCER_CC2E);
				TIM->CCMR1 = (TIM->CCMR1 & ~(TIM_CCMR1_OC2M | TIM_CCMR1_CC2S)) | (TIM_OCMODE_PWM1 << 8);
				if (TIM == TIM1)
					TIM->CR2 = (TIM->CR2 & ~(TIM_CR2_OIS2)) | (TIM_OCIDLESTATE_SET << 2);
				TIM->CCR2 = 0;
				TIM->CCER = (TIM->CCER & ~(TIM_CCER_CC2P)) | ((TIM_OUTPUTSTATE_ENABLE | TIM_OCPOLARITY_HIGH) << 4);
				break;
			case TIM_CHANNEL_3:
				TIM->CCER &= (uint16_t)(~(uint16_t)TIM_CCER_CC3E);
				TIM->CCMR2 = (TIM->CCMR2 & ~(TIM_CCMR2_OC3M | TIM_CCMR2_CC3S)) | (TIM_OCMODE_PWM1);
				if (TIM == TIM1)
					TIM->CR2 = (TIM->CR2 & ~(TIM_CR2_OIS3)) | (TIM_OCIDLESTATE_SET << 4);
				TIM->CCR3 = 0;
				TIM->CCER = (TIM->CCER & ~(TIM_CCER_CC3P)) | ((TIM_OUTPUTSTATE_ENABLE | TIM_OCPOLARITY_HIGH) << 8);
				break;
			case TIM_CHANNEL_4:
				TIM->CCER &= (uint16_t)(~(uint16_t)TIM_CCER_CC4E);
				TIM->CCMR2 = (TIM->CCMR2 & ~(TIM_CCMR2_OC4M | TIM_CCMR2_CC4S)) | (TIM_OCMODE_PWM1 << 8);
				if (TIM == TIM1)
					TIM->CR2 = (TIM->CR2 & ~(TIM_CR2_OIS4)) | (TIM_OCIDLESTATE_SET << 6);
				TIM->CCR4 = 0;
				TIM->CCER = (TIM->CCER & ~(TIM_CCER_CC4P)) | ((TIM_OUTPUTSTATE_ENABLE | TIM_OCPOLARITY_HIGH) << 12);
				break;
			}

			//enable timer
			TIM->CR1 |= TIM_CR1_CEN;
			
			//enable pwm output
			TIM->BDTR |= TIM_BDTR_MOE;
		}
		else
		{
			GPIO_InitStruct.GPIO_Mode = GPIO_Mode_IN_FLOATING;
			GPIO_InitStruct.GPIO_Speed = GPIO_Speed_50MHz;

			GPIO_Init(GPIO, &GPIO_InitStruct);
			
			if (!((TIM == TIM1 && (TIM1_Freq_Locked)) || (TIM == TIM2 && (TIM2_Freq_Locked)) || (TIM == TIM3 && (TIM3_Freq_Locked)) || (TIM == TIM4 && (TIM4_Freq_Locked))))
			{
				//set the frequency and mode
				TIM->CR1 = (TIM->CR1 & ~(TIM_CR1_DIR | TIM_CR1_CMS | TIM_CR1_CKD)) | TIM_COUNTERMODE_UP;
				TIM->PSC = std::max(TIM->PSC, (unsigned short)ceil(((72 * 1000 * 1000.0) / 65535) / minFrequency));
				TIM->ARR = 0xFFFF;
			}
			//make sure we are in the right mode
			else if(TIM->CR1 & (~(TIM_CR1_DIR | TIM_CR1_CMS | TIM_CR1_CKD) | TIM_COUNTERMODE_UP))
				return;   //TODO: figure out errors
			
			//enable intterupt
			if (TIM == TIM1)
			{
				NVIC->IP[TIM1_UP_IRQn] = 0;
				NVIC->ISER[TIM1_UP_IRQn >> 0x05] = 0x01 << (TIM1_UP_IRQn & 0x1F);
				NVIC->IP[TIM1_CC_IRQn] = 0;
				NVIC->ISER[TIM1_CC_IRQn >> 0x05] = 0x01 << (TIM1_CC_IRQn & 0x1F);
			}
			else if (TIM == TIM2)
			{
				NVIC->IP[TIM2_IRQn] = 0;
				NVIC->ISER[TIM2_IRQn >> 0x05] = 0x01 << (TIM2_IRQn & 0x1F);
			}
			else if (TIM == TIM3)
			{
				NVIC->IP[TIM3_IRQn] = 0;
				NVIC->ISER[TIM3_IRQn >> 0x05] = 0x01 << (TIM3_IRQn & 0x1F);
			}
			else if (TIM == TIM4)
			{
				NVIC->IP[TIM4_IRQn] = 0;
				NVIC->ISER[TIM4_IRQn >> 0x05] = 0x01 << (TIM4_IRQn & 0x1F);
			}
												
			switch (TIM_CHANNEL)
			{
			case TIM_CHANNEL_1:
				TIM->SR = ~(TIM_IT_CC1 | TIM_IT_CC2);
				TIM->DIER |= TIM_IT_CC1 | TIM_IT_CC2;
				TIM->CCER &= ~(TIM_CCER_CC1E | TIM_CCER_CC2E);
				TIM->CCMR1 = (TIM->CCMR1 & ~(TIM_CCMR1_CC1S | TIM_CCMR1_IC1F | TIM_CCMR1_CC2S | TIM_CCMR1_IC2F | TIM_CCMR1_IC1PSC | TIM_CCMR1_IC2PSC)) | TIM_ICSELECTION_DIRECTTI | (TIM_ICSELECTION_INDIRECTTI << 8) | TIM_ICPSC_DIV1 | (TIM_ICPSC_DIV1 << 8);
				TIM->CCER = (TIM->CCER & ~(TIM_CCER_CC1P | TIM_CCER_CC2P)) | TIM_ICPOLARITY_RISING | TIM_CCER_CC1E | (TIM_ICPOLARITY_FALLING << 4) | TIM_CCER_CC2E;
			case TIM_CHANNEL_2:
				TIM->SR = ~(TIM_IT_CC1 | TIM_IT_CC2);
				TIM->DIER |= TIM_IT_CC1 | TIM_IT_CC2;
				TIM->CCER &= ~(TIM_CCER_CC1E | TIM_CCER_CC2E);
				TIM->CCMR1 = (TIM->CCMR1 & ~(TIM_CCMR1_CC1S | TIM_CCMR1_IC1F | TIM_CCMR1_CC2S | TIM_CCMR1_IC2F | TIM_CCMR1_IC1PSC | TIM_CCMR1_IC2PSC)) | TIM_ICSELECTION_INDIRECTTI | (TIM_ICSELECTION_DIRECTTI << 8) | TIM_ICPSC_DIV1 | (TIM_ICPSC_DIV1 << 8);
				TIM->CCER = (TIM->CCER & ~(TIM_CCER_CC1P | TIM_CCER_CC2P)) | TIM_ICPOLARITY_RISING | TIM_CCER_CC1E | (TIM_ICPOLARITY_FALLING << 4) | TIM_CCER_CC2E;
			case TIM_CHANNEL_3:
				TIM->SR = ~(TIM_IT_CC3 | TIM_IT_CC4);
				TIM->DIER |= TIM_IT_CC3 | TIM_IT_CC4;
				TIM->CCER &= ~(TIM_CCER_CC3E | TIM_CCER_CC4E);
				TIM->CCMR2 = (TIM->CCMR2 & ~(TIM_CCMR2_CC3S | TIM_CCMR2_IC3F | TIM_CCMR2_CC3S | TIM_CCMR2_IC3F | TIM_CCMR2_IC3PSC | TIM_CCMR2_IC3PSC)) | TIM_ICSELECTION_DIRECTTI | (TIM_ICSELECTION_INDIRECTTI << 8) | TIM_ICPSC_DIV1 | (TIM_ICPSC_DIV1 << 8);
				TIM->CCER = (TIM->CCER & ~(TIM_CCER_CC3P | TIM_CCER_CC4P)) | (TIM_ICPOLARITY_RISING << 8) | TIM_CCER_CC3E | (TIM_ICPOLARITY_FALLING << 12) | TIM_CCER_CC4E;
			case TIM_CHANNEL_4:
				TIM->SR = ~(TIM_IT_CC3 | TIM_IT_CC4);
				TIM->DIER |= TIM_IT_CC3 | TIM_IT_CC4;
				TIM->CCER &= ~(TIM_CCER_CC3E | TIM_CCER_CC4E);
				TIM->CCMR2 = (TIM->CCMR2 & ~(TIM_CCMR2_CC3S | TIM_CCMR2_IC3F | TIM_CCMR2_CC3S | TIM_CCMR2_IC3F | TIM_CCMR2_IC3PSC | TIM_CCMR2_IC3PSC)) | TIM_ICSELECTION_INDIRECTTI | (TIM_ICSELECTION_DIRECTTI << 8) | TIM_ICPSC_DIV1 | (TIM_ICPSC_DIV1 << 8);
				TIM->CCER = (TIM->CCER & ~(TIM_CCER_CC3P | TIM_CCER_CC4P)) | (TIM_ICPOLARITY_RISING << 8) | TIM_CCER_CC3E | (TIM_ICPOLARITY_FALLING << 12) | TIM_CCER_CC4E;
			}
			
			//enable timer
			TIM->CR1 |= TIM_CR1_CEN;
		}
	}
	
	void Stm32F103PwmService::InterruptTim1()
	{
		if (TIM4->SR & TIM_IT_CC1 && TIM4->DIER & TIM_IT_CC1)
		{
			_prevCC[0][0] = _currCC[0][0];
			_currCC[0][0] = TIM1->CCR1;
		}
		if (TIM4->SR & TIM_IT_CC2 && TIM4->DIER & TIM_IT_CC2)
		{
			_prevCC[0][1] = _currCC[0][1];
			_currCC[0][1] = TIM1->CCR2;
		}
		if (TIM4->SR & TIM_IT_CC3 && TIM4->DIER & TIM_IT_CC3)
		{
			_prevCC[0][2] = _currCC[0][2];
			_currCC[0][2] = TIM1->CCR3;
		}
		if (TIM4->SR & TIM_IT_CC4 && TIM4->DIER & TIM_IT_CC4)
		{
			_prevCC[0][3] = _currCC[0][3];
			_currCC[0][3] = TIM1->CCR4;
		}
	}
	
	void Stm32F103PwmService::InterruptTim2()
	{
		if (TIM2->SR & TIM_IT_CC1 && TIM2->DIER & TIM_IT_CC1)
		{
			_prevCC[1][0] = _currCC[1][0];
			_currCC[1][0] = TIM2->CCR1;
		}
		if (TIM2->SR & TIM_IT_CC2 && TIM2->DIER & TIM_IT_CC2)
		{
			_prevCC[1][1] = _currCC[1][1];
			_currCC[1][1] = TIM2->CCR2;
		}
		if (TIM2->SR & TIM_IT_CC3 && TIM2->DIER & TIM_IT_CC3)
		{
			_prevCC[1][2] = _currCC[1][2];
			_currCC[1][2] = TIM2->CCR3;
		}
		if (TIM2->SR & TIM_IT_CC4 && TIM2->DIER & TIM_IT_CC4)
		{
			_prevCC[1][3] = _currCC[1][3];
			_currCC[1][3] = TIM2->CCR4;
		}
	}
	
	void Stm32F103PwmService::InterruptTim3()
	{
		if (TIM3->SR & TIM_IT_CC1 && TIM3->DIER & TIM_IT_CC1)
		{
			_prevCC[2][0] = _currCC[2][0];
			_currCC[2][0] = TIM3->CCR1;
		}
		if (TIM3->SR & TIM_IT_CC2 && TIM3->DIER & TIM_IT_CC2)
		{
			_prevCC[2][1] = _currCC[2][1];
			_currCC[2][1] = TIM3->CCR2;
		}
		if (TIM3->SR & TIM_IT_CC3 && TIM3->DIER & TIM_IT_CC3)
		{
			_prevCC[2][2] = _currCC[2][2];
			_currCC[2][2] = TIM3->CCR3;
		}
		if (TIM3->SR & TIM_IT_CC4 && TIM3->DIER & TIM_IT_CC4)
		{
			_prevCC[2][3] = _currCC[2][3];
			_currCC[2][3] = TIM3->CCR4;
		}
	}
	
	void Stm32F103PwmService::InterruptTim4()
	{
		if (TIM4->SR & TIM_IT_CC1 && TIM4->DIER & TIM_IT_CC1)
		{
			_prevCC[3][0] = _currCC[3][0];
			_currCC[3][0] = TIM4->CCR1;
		}
		if (TIM4->SR & TIM_IT_CC2 && TIM4->DIER & TIM_IT_CC2)
		{
			_prevCC[3][1] = _currCC[3][1];
			_currCC[3][1] = TIM4->CCR2;
		}
		if (TIM4->SR & TIM_IT_CC3 && TIM4->DIER & TIM_IT_CC3)
		{
			_prevCC[3][2] = _currCC[3][2];
			_currCC[3][2] = TIM4->CCR3;
		}
		if (TIM4->SR & TIM_IT_CC4 && TIM4->DIER & TIM_IT_CC4)
		{
			_prevCC[3][3] = _currCC[3][3];
			_currCC[3][3] = TIM4->CCR4;
		}
	}
		
	HardwareAbstraction::PwmValue Stm32F103PwmService::ReadPin(unsigned char pin)
	{
		HardwareAbstraction::PwmValue value = HardwareAbstraction::PwmValue();
		if (pin == 0)
			return value;
		
		unsigned char timerMinus1 = 0;;
		unsigned char iCMinus1 = 0;
		unsigned char iCMinus1Neg = 0;
		switch (pin)
		{
		case 1:
		case 2:
			timerMinus1 = 1;
			iCMinus1 = 0;
			iCMinus1Neg = 1;
			break;
		case 3 :
		case 4 :
			timerMinus1 = 1;
			iCMinus1 = 2;
			iCMinus1Neg = 3;
			break;
		case 7 :
		case 8 :
			timerMinus1 = 2;
			iCMinus1 = 0;
			iCMinus1Neg = 1;
			break;
		case 9 :
		case 10 :
			timerMinus1 = 0;
			iCMinus1 = 0;
			iCMinus1Neg = 1;
			break;
		case 11 :
		case 12 :
			timerMinus1 = 0;
			iCMinus1 = 2;
			iCMinus1Neg = 3;
			break;
		case 17 :
		case 18 :
			timerMinus1 = 2;
			iCMinus1 = 2;
			iCMinus1Neg = 3;
			break;
		case 23 :
		case 24 :
			timerMinus1 = 3;
			iCMinus1 = 0;
			iCMinus1Neg = 1;
			break;
		case 25 :
		case 26 :
			timerMinus1 = 3;
			iCMinus1 = 2;
			iCMinus1Neg = 3;
			break;
		}
		
		int pulseTick = (int)_currCC[timerMinus1][iCMinus1Neg] - _currCC[timerMinus1][iCMinus1];
		if(pulseTick < 0)
			pulseTick = (int)_currCC[timerMinus1][iCMinus1Neg] - _prevCC[timerMinus1][iCMinus1];
		if (pulseTick < 0)
			pulseTick = ((int)_currCC[timerMinus1][iCMinus1Neg] - _currCC[timerMinus1][iCMinus1]) + 65535;
		unsigned short periodTick = _currCC[timerMinus1][iCMinus1] - _prevCC[timerMinus1][iCMinus1];
		
		unsigned short prescaler = 1;
		switch (timerMinus1) 
		{
		case 0:
			prescaler = TIM1->PSC;
			break;
		case 1:
			prescaler = TIM2->PSC;
			break;
		case 2:
			prescaler = TIM3->PSC;
			break;
		case 3:
			prescaler = TIM4->PSC;
			break;
		}
		
		value.PulseWidth = pulseTick * (prescaler / (72 * 1000 * 1000.0));
		value.Period = periodTick * (prescaler / (72 * 1000 * 1000.0));
		
		return value;
	}
	
	void Stm32F103PwmService::WritePin(unsigned char pin, HardwareAbstraction::PwmValue value)
	{
		if (pin == 0)
			return;
		
		TIM_TypeDef *TIM;
		unsigned char oC;
		switch (pin)
		{
		case 1:
			oC = 1;
			TIM = TIM2;
			break;
		case 2:
			oC = 2;
			TIM = TIM2;
			break;
		case 3:
			oC = 3;
			TIM = TIM2;
			break;
		case 4:
			oC = 4;
			TIM = TIM2;
			break;
		case 7:
			oC = 1;
			TIM = TIM3;
			break;
		case 8:
			oC = 2;
			TIM = TIM3;
			break;
		case 9:
			oC = 1;
			TIM = TIM1;
			break;
		case 10:
			oC = 2;
			TIM = TIM1;
			break;
		case 11:
			oC = 3;
			TIM = TIM1;
			break;
		case 12:
			oC = 4;
			TIM = TIM1;
			break;
		case 17:
			oC = 3;
			TIM = TIM3;
			break;
		case 18:
			oC = 4;
			TIM = TIM3;
			break;
		case 23:
			oC = 1;
			TIM = TIM4;
			break;
		case 24:
			oC = 2;
			TIM = TIM4;
			break;
		case 25:
			oC = 3;
			TIM = TIM4;
			break;
		case 26:
			oC = 4;
			TIM = TIM4;
			break;
		}
		
		if (!((TIM == TIM1 && (TIM1_Freq_Locked || TIM1_Input)) || (TIM == TIM2 && (TIM2_Freq_Locked || TIM2_Input)) || (TIM == TIM3 && (TIM3_Freq_Locked || TIM1_Input)) || (TIM == TIM4 && (TIM4_Freq_Locked || TIM4_Input))))
		{
			//Set period
			TIM->PSC = std::max(1, (int)ceil(((72 * 1000 * 1000.0) / 65535) * value.Period));
			TIM->ARR = (int)ceil(((72 * 1000 * 1000.0) / TIM->PSC) * value.Period);
		}

		//set pulse width
		switch (oC)
		{
		case 1:
			TIM->CCR1 = TIM->ARR * (value.PulseWidth / value.Period);
			break;
		case 2:
			TIM->CCR2 = TIM->ARR * (value.PulseWidth / value.Period);
			break;
		case 3:
			TIM->CCR3 = TIM->ARR * (value.PulseWidth / value.Period);
			break;
		case 4:
			TIM->CCR4 = TIM->ARR * (value.PulseWidth / value.Period);
		}
	}
}