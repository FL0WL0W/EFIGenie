#include "PinDirection.h"
#include "IPwmService.h"
#include "misc.h"
#include "Stm32F103PwmService.h"
#include <stm32f10x_gpio.h>
#include <stm32f10x_tim.h>
#include <stm32f10x_rcc.h>
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
		
		uint16_t TIM_Channel;
		TIM_TypeDef *TIM;
		GPIO_TypeDef *GPIO;
		
		GPIO = GPIO;		
		GPIO_InitTypeDef GPIO_InitStruct;
		
		switch (pin)
		{
		case 1:
			TIM_Channel = TIM_Channel_1;
			TIM = TIM2;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_0;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM2, ENABLE);
			break;
		case 2:
			TIM_Channel = TIM_Channel_2;
			TIM = TIM2;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_1;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM2, ENABLE);
			break;
		case 3:
			TIM_Channel = TIM_Channel_3;
			TIM = TIM2;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_2;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM2, ENABLE);
			break;
		case 4:
			TIM_Channel = TIM_Channel_4;
			TIM = TIM2;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_3;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM2, ENABLE);
			break;
		case 7:
			TIM_Channel = TIM_Channel_1;
			TIM = TIM3;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_6;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);
			break;
		case 8:
			TIM_Channel = TIM_Channel_2;
			TIM = TIM3;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_7;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);
			break;
		case 9:
			TIM_Channel = TIM_Channel_1;
			TIM = TIM1;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_8;
			RCC_APB2PeriphClockCmd(RCC_APB2Periph_TIM1, ENABLE);
			break;
		case 10:
			TIM_Channel = TIM_Channel_2;
			TIM = TIM1;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_9;
			RCC_APB2PeriphClockCmd(RCC_APB2Periph_TIM1, ENABLE);
			break;
		case 11:
			TIM_Channel = TIM_Channel_3;
			TIM = TIM1;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_10;
			RCC_APB2PeriphClockCmd(RCC_APB2Periph_TIM1, ENABLE);
			break;
		case 12:
			TIM_Channel = TIM_Channel_4;
			TIM = TIM1;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_11;
			RCC_APB2PeriphClockCmd(RCC_APB2Periph_TIM1, ENABLE);
			break;
		case 17:
			TIM_Channel = TIM_Channel_3;
			TIM = TIM3;
			GPIO = GPIOB;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_0;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);
			break;
		case 18:
			TIM_Channel = TIM_Channel_4;
			TIM = TIM3;
			GPIO = GPIOB;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_1;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);
			break;
		case 23:
			TIM_Channel = TIM_Channel_1;
			TIM = TIM4;
			GPIO = GPIOB;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_6;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM4, ENABLE);
			break;
		case 24:
			TIM_Channel = TIM_Channel_2;
			TIM = TIM4;
			GPIO = GPIOB;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_7;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM4, ENABLE);
			break;
		case 25:
			TIM_Channel = TIM_Channel_3;
			TIM = TIM4;
			GPIO = GPIOB;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_8;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM4, ENABLE);
			break;
		case 26:
			TIM_Channel = TIM_Channel_4;
			TIM = TIM4;
			GPIO = GPIOB;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_9;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM4, ENABLE);
			break;
		}
		
		if (direction == HardwareAbstraction::Out)
		{
			GPIO_InitStruct.GPIO_Mode = GPIO_Mode_AF_PP;
			GPIO_InitStruct.GPIO_Speed = GPIO_Speed_50MHz;

			GPIO_Init(GPIO, &GPIO_InitStruct);
			
			if (!((TIM == TIM1 && (TIM1_Freq_Locked || TIM1_Input) || (TIM == TIM12 && (TIM2_Freq_Locked || TIM2_Input)) && (TIM == TIM3 && (TIM3_Freq_Locked || TIM1_Input)) || (TIM == TIM4 && (TIM4_Freq_Locked || TIM4_Input)))))
			{
				TIM_TimeBaseInitTypeDef timeBaseInit;
				TIM_TimeBaseStructInit(&timeBaseInit);

				//base Init
				timeBaseInit.TIM_Prescaler = std::max((unsigned short)1, (unsigned short)ceil(((72 * 1000 * 1000.0) / 65535) * 1));
				timeBaseInit.TIM_CounterMode = TIM_CounterMode_Up;
				timeBaseInit.TIM_Period = (int)ceil(((72 * 1000 * 1000.0) / timeBaseInit.TIM_Prescaler) * 1);
				timeBaseInit.TIM_ClockDivision = 0;
				timeBaseInit.TIM_RepetitionCounter = 0;
				TIM_TimeBaseInit(TIM, &timeBaseInit);
			}

			TIM_OCInitTypeDef outputChannelInit;
			TIM_OCStructInit(&outputChannelInit);
			outputChannelInit.TIM_OCMode = TIM_OCMode_PWM1;
			outputChannelInit.TIM_Pulse = 0;
			outputChannelInit.TIM_OutputState = TIM_OutputState_Enable;
			outputChannelInit.TIM_OutputNState = TIM_OutputState_Disable;
			outputChannelInit.TIM_OCIdleState = TIM_OCIdleState_Set;
			outputChannelInit.TIM_OCPolarity = TIM_OCPolarity_High;

			switch (TIM_Channel)
			{
			case TIM_Channel_1:
				TIM_OC1Init(TIM, &outputChannelInit);
				break;
			case TIM_Channel_2:
				TIM_OC2Init(TIM, &outputChannelInit);
				break;
			case TIM_Channel_3:
				TIM_OC3Init(TIM, &outputChannelInit);
				break;
			case TIM_Channel_4:
				TIM_OC4Init(TIM, &outputChannelInit);	
			}

			TIM_Cmd(TIM, ENABLE);

			TIM_CtrlPWMOutputs(TIM, ENABLE);
		}
		else
		{
			GPIO_InitStruct.GPIO_Mode = GPIO_Mode_IN_FLOATING;
			GPIO_InitStruct.GPIO_Speed = GPIO_Speed_50MHz;

			GPIO_Init(GPIO, &GPIO_InitStruct);
			
			if (!((TIM == TIM1 && (TIM1_Freq_Locked) || (TIM == TIM12 && (TIM2_Freq_Locked)) && (TIM == TIM3 && (TIM3_Freq_Locked)) || (TIM == TIM4 && (TIM4_Freq_Locked)))))
			{
				TIM_TimeBaseInitTypeDef timeBaseInit;
				TIM_TimeBaseStructInit(&timeBaseInit);

				//base Init
				timeBaseInit.TIM_Prescaler = std::max(TIM_GetPrescaler(TIM), (unsigned short)ceil(((72 * 1000 * 1000.0) / 65535) / minFrequency));
				timeBaseInit.TIM_CounterMode = TIM_CounterMode_Up;
				timeBaseInit.TIM_Period = 0xFFFF;
				timeBaseInit.TIM_ClockDivision = 0;
				timeBaseInit.TIM_RepetitionCounter = 0;
				TIM_TimeBaseInit(TIM, &timeBaseInit);
			
				TIM_Cmd(TIM, ENABLE);
			}
			
			TIM_ICInitTypeDef timeIcInit;
			TIM_ICStructInit(&timeIcInit);
			timeIcInit.TIM_ICPrescaler = TIM_ICPSC_DIV1;
			
			NVIC_InitTypeDef   NVIC_InitStructure;
			if (TIM == TIM1)
				NVIC_InitStructure.NVIC_IRQChannel = TIM1_UP_IRQn | TIM1_CC_IRQn;
			else if (TIM == TIM2)
				NVIC_InitStructure.NVIC_IRQChannel = TIM2_IRQn;
			else if (TIM == TIM3)
				NVIC_InitStructure.NVIC_IRQChannel = TIM3_IRQn;
			else if (TIM == TIM4)
				NVIC_InitStructure.NVIC_IRQChannel = TIM4_IRQn;
			NVIC_InitStructure.NVIC_IRQChannelPreemptionPriority = 0;
			NVIC_InitStructure.NVIC_IRQChannelSubPriority = 0;
			NVIC_InitStructure.NVIC_IRQChannelCmd = ENABLE;
			NVIC_Init(&NVIC_InitStructure);
			
			switch (TIM_Channel)
			{
			case TIM_Channel_1:
				timeIcInit.TIM_Channel = TIM_Channel_1;
				timeIcInit.TIM_ICSelection = TIM_ICSelection_DirectTI;
				timeIcInit.TIM_ICPolarity = TIM_ICPolarity_Rising;
				TIM_ICInit(TIM, &timeIcInit);
				timeIcInit.TIM_Channel = TIM_Channel_2;
				timeIcInit.TIM_ICSelection = TIM_ICSelection_IndirectTI;
				timeIcInit.TIM_ICPolarity = TIM_ICPolarity_Falling;
				TIM_ICInit(TIM, &timeIcInit);
			case TIM_Channel_2:
				timeIcInit.TIM_Channel = TIM_Channel_2;
				timeIcInit.TIM_ICSelection = TIM_ICSelection_DirectTI;
				timeIcInit.TIM_ICPolarity = TIM_ICPolarity_Rising;
				TIM_ICInit(TIM, &timeIcInit);
				timeIcInit.TIM_Channel = TIM_Channel_1;
				timeIcInit.TIM_ICSelection = TIM_ICSelection_IndirectTI;
				timeIcInit.TIM_ICPolarity = TIM_ICPolarity_Falling;
				TIM_ICInit(TIM, &timeIcInit);
			case TIM_Channel_3:
				timeIcInit.TIM_Channel = TIM_Channel_3;
				timeIcInit.TIM_ICSelection = TIM_ICSelection_DirectTI;
				timeIcInit.TIM_ICPolarity = TIM_ICPolarity_Rising;
				TIM_ICInit(TIM, &timeIcInit);
				timeIcInit.TIM_Channel = TIM_Channel_4;
				timeIcInit.TIM_ICSelection = TIM_ICSelection_IndirectTI;
				timeIcInit.TIM_ICPolarity = TIM_ICPolarity_Falling;
				TIM_ICInit(TIM, &timeIcInit);
			case TIM_Channel_4:
				timeIcInit.TIM_Channel = TIM_Channel_4;
				timeIcInit.TIM_ICSelection = TIM_ICSelection_DirectTI;
				timeIcInit.TIM_ICPolarity = TIM_ICPolarity_Rising;
				TIM_ICInit(TIM, &timeIcInit);
				timeIcInit.TIM_Channel = TIM_Channel_3;
				timeIcInit.TIM_ICSelection = TIM_ICSelection_IndirectTI;
				timeIcInit.TIM_ICPolarity = TIM_ICPolarity_Falling;
				TIM_ICInit(TIM, &timeIcInit);
			}
		}
	}
	
	void Stm32F103PwmService::InterruptTim1()
	{
		if (TIM4->SR & TIM_IT_CC1 && TIM4->DIER & TIM_IT_CC1)
		{
			_prevCC[0][0] = _currCC[0][0];
			_currCC[0][0] = TIM_GetCapture1(TIM1);
		}
		if (TIM4->SR & TIM_IT_CC2 && TIM4->DIER & TIM_IT_CC2)
		{
			_prevCC[0][1] = _currCC[0][1];
			_currCC[0][1] = TIM_GetCapture2(TIM1);
		}
		if (TIM4->SR & TIM_IT_CC3 && TIM4->DIER & TIM_IT_CC3)
		{
			_prevCC[0][2] = _currCC[0][2];
			_currCC[0][2] = TIM_GetCapture3(TIM1);
		}
		if (TIM4->SR & TIM_IT_CC4 && TIM4->DIER & TIM_IT_CC4)
		{
			_prevCC[0][3] = _currCC[0][3];
			_currCC[0][3] = TIM_GetCapture4(TIM1); 
		}
	}
	
	void Stm32F103PwmService::InterruptTim2()
	{
		if (TIM2->SR & TIM_IT_CC1 && TIM2->DIER & TIM_IT_CC1)
		{
			_prevCC[1][0] = _currCC[1][0];
			_currCC[1][0] = TIM_GetCapture1(TIM2);
		}
		if (TIM2->SR & TIM_IT_CC2 && TIM2->DIER & TIM_IT_CC2)
		{
			_prevCC[1][1] = _currCC[1][1];
			_currCC[1][1] = TIM_GetCapture2(TIM2);
		}
		if (TIM2->SR & TIM_IT_CC3 && TIM2->DIER & TIM_IT_CC3)
		{
			_prevCC[1][2] = _currCC[1][2];
			_currCC[1][2] = TIM_GetCapture3(TIM2);
		}
		if (TIM2->SR & TIM_IT_CC4 && TIM2->DIER & TIM_IT_CC4)
		{
			_prevCC[1][3] = _currCC[1][3];
			_currCC[1][3] = TIM_GetCapture4(TIM2); 
		}
	}
	
	void Stm32F103PwmService::InterruptTim3()
	{
		if (TIM3->SR & TIM_IT_CC1 && TIM3->DIER & TIM_IT_CC1)
		{
			_prevCC[2][0] = _currCC[2][0];
			_currCC[2][0] = TIM_GetCapture1(TIM3);
		}
		if (TIM3->SR & TIM_IT_CC2 && TIM3->DIER & TIM_IT_CC2)
		{
			_prevCC[2][1] = _currCC[2][1];
			_currCC[2][1] = TIM_GetCapture2(TIM3);
		}
		if (TIM3->SR & TIM_IT_CC3 && TIM3->DIER & TIM_IT_CC3)
		{
			_prevCC[2][2] = _currCC[2][2];
			_currCC[2][2] = TIM_GetCapture3(TIM3);
		}
		if (TIM3->SR & TIM_IT_CC4 && TIM3->DIER & TIM_IT_CC4)
		{
			_prevCC[2][3] = _currCC[2][3];
			_currCC[2][3] = TIM_GetCapture4(TIM3); 
		}
	}
	
	void Stm32F103PwmService::InterruptTim4()
	{
		if (TIM4->SR & TIM_IT_CC1 && TIM4->DIER & TIM_IT_CC1)
		{
			_prevCC[3][0] = _currCC[3][0];
			_currCC[3][0] = TIM_GetCapture1(TIM4);
		}
		if (TIM4->SR & TIM_IT_CC2 && TIM4->DIER & TIM_IT_CC2)
		{
			_prevCC[3][1] = _currCC[3][1];
			_currCC[3][1] = TIM_GetCapture2(TIM4);
		}
		if (TIM4->SR & TIM_IT_CC3 && TIM4->DIER & TIM_IT_CC3)
		{
			_prevCC[3][2] = _currCC[3][2];
			_currCC[3][2] = TIM_GetCapture3(TIM4);
		}
		if (TIM4->SR & TIM_IT_CC4 && TIM4->DIER & TIM_IT_CC4)
		{
			_prevCC[3][3] = _currCC[3][3];
			_currCC[3][3] = TIM_GetCapture4(TIM4); 
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
			timerMinus1 = 1;
			iCMinus1 = 0;
			iCMinus1Neg = 1;
			break;
		case 2 :
			timerMinus1 = 1;
			iCMinus1 = 1;
			iCMinus1Neg = 0;
			break;
		case 3 :
			timerMinus1 = 1;
			iCMinus1 = 2;
			iCMinus1Neg = 3;
			break;
		case 4 :
			timerMinus1 = 1;
			iCMinus1 = 3;
			iCMinus1Neg = 2;
			break;
		case 7 :
			timerMinus1 = 2;
			iCMinus1 = 0;
			iCMinus1Neg = 1;
			break;
		case 8 :
			timerMinus1 = 2;
			iCMinus1 = 1;
			iCMinus1Neg = 0;
			break;
		case 9 :
			timerMinus1 = 0;
			iCMinus1 = 0;
			iCMinus1Neg = 1;
			break;
		case 10 :
			timerMinus1 = 0;
			iCMinus1 = 1;
			iCMinus1Neg = 0;
			break;
		case 11 :
			timerMinus1 = 0;
			iCMinus1 = 2;
			iCMinus1Neg = 3;
			break;
		case 12 :
			timerMinus1 = 0;
			iCMinus1 = 3;
			iCMinus1Neg = 2;
			break;
		case 17 :
			timerMinus1 = 2;
			iCMinus1 = 2;
			iCMinus1Neg = 3;
			break;
		case 18 :
			timerMinus1 = 2;
			iCMinus1 = 3;
			iCMinus1Neg = 2;
			break;
		case 23 :
			timerMinus1 = 3;
			iCMinus1 = 0;
			iCMinus1Neg = 1;
			break;
		case 24 :
			timerMinus1 = 3;
			iCMinus1 = 1;
			iCMinus1Neg = 0;
			break;
		case 25 :
			timerMinus1 = 3;
			iCMinus1 = 2;
			iCMinus1Neg = 3;
			break;
		case 26 :
			timerMinus1 = 3;
			iCMinus1 = 3;
			iCMinus1Neg = 2;
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
			prescaler = TIM_GetPrescaler(TIM1);
			break;
		case 1:
			prescaler = TIM_GetPrescaler(TIM2);
			break;
		case 2:
			prescaler = TIM_GetPrescaler(TIM3);
			break;
		case 3:
			prescaler = TIM_GetPrescaler(TIM4);
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
		
		if (!((TIM == TIM1 && (TIM1_Freq_Locked || TIM1_Input) || (TIM == TIM12 && (TIM2_Freq_Locked || TIM2_Input)) && (TIM == TIM3 && (TIM3_Freq_Locked || TIM1_Input)) || (TIM == TIM4 && (TIM4_Freq_Locked || TIM4_Input)))))
		{
			TIM_TimeBaseInitTypeDef timeBaseInit;
			TIM_TimeBaseStructInit(&timeBaseInit);

			//base Init
			timeBaseInit.TIM_Prescaler = std::max(1, (int)ceil(((72 * 1000 * 1000.0) / 65535) * value.Period));
			timeBaseInit.TIM_CounterMode = TIM_CounterMode_Up;
			timeBaseInit.TIM_Period = (int)ceil(((72 * 1000 * 1000.0) / timeBaseInit.TIM_Prescaler) * value.Period);
			timeBaseInit.TIM_ClockDivision = 0;
			timeBaseInit.TIM_RepetitionCounter = 0;
			TIM_TimeBaseInit(TIM, &timeBaseInit);
			
			TIM_Cmd(TIM, ENABLE);
		}

		TIM_OCInitTypeDef outputChannelInit;
		TIM_OCStructInit(&outputChannelInit);
		outputChannelInit.TIM_OCMode = TIM_OCMode_PWM1;
		outputChannelInit.TIM_Pulse = TIM->ARR * (value.PulseWidth / value.Period);
		outputChannelInit.TIM_OutputState = TIM_OutputState_Enable;
		outputChannelInit.TIM_OutputNState = TIM_OutputState_Disable;
		outputChannelInit.TIM_OCIdleState = TIM_OCIdleState_Set;
		outputChannelInit.TIM_OCPolarity = TIM_OCPolarity_High;

		switch (oC)
		{
		case 1:
			TIM_OC1Init(TIM, &outputChannelInit);
			break;
		case 2:
			TIM_OC2Init(TIM, &outputChannelInit);
			break;
		case 3:
			TIM_OC3Init(TIM, &outputChannelInit);
			break;
		case 4:
			TIM_OC4Init(TIM, &outputChannelInit);	
		}
	}
}