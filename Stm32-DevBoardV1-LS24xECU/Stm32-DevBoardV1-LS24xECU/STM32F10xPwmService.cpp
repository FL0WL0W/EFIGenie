#include "PinDirection.h"
#include "IPwmService.h"
#include "Stm32F10xPwmService.h"
#include <stm32f10x_gpio.h>
#include <stm32f10x_tim.h>
#include <stm32f10x_rcc.h>
#include <algorithm>
#include <math.h>

namespace Stm32
{
	void Stm32F10xPwmService::InitPin(unsigned char pin, HardwareAbstraction::PinDirection direction)
	{
		TIM_TypeDef *TIM;
		GPIO_TypeDef *GPIO;
		GPIO = GPIO;		
		GPIO_InitTypeDef GPIO_InitStruct;
		unsigned char oC;
		
		switch (pin)
		{
		case 1:
			oC = 1;
			TIM = TIM2;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_0;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM2, ENABLE);
			break;
		case 2:
			oC = 2;
			TIM = TIM2;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_1;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM2, ENABLE);
			break;
		case 3:
			oC = 3;
			TIM = TIM2;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_2;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM2, ENABLE);
			break;
		case 4:
			oC = 4;
			TIM = TIM2;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_3;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM2, ENABLE);
			break;
		case 7:
			oC = 1;
			TIM = TIM3;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_6;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);
			break;
		case 8:
			oC = 2;
			TIM = TIM3;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_7;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);
			break;
		case 9:
			oC = 1;
			TIM = TIM1;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_8;
			RCC_APB2PeriphClockCmd(RCC_APB2Periph_TIM1, ENABLE);
			break;
		case 10:
			oC = 2;
			TIM = TIM1;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_9;
			RCC_APB2PeriphClockCmd(RCC_APB2Periph_TIM1, ENABLE);
			break;
		case 11:
			oC = 3;
			TIM = TIM1;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_10;
			RCC_APB2PeriphClockCmd(RCC_APB2Periph_TIM1, ENABLE);
			break;
		case 12:
			oC = 4;
			TIM = TIM1;
			GPIO = GPIOA;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_11;
			RCC_APB2PeriphClockCmd(RCC_APB2Periph_TIM1, ENABLE);
			break;
		case 17:
			oC = 3;
			TIM = TIM3;
			GPIO = GPIOB;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_0;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);
			break;
		case 18:
			oC = 4;
			TIM = TIM3;
			GPIO = GPIOB;
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_1;
			RCC_APB1PeriphClockCmd(RCC_APB1Periph_TIM3, ENABLE);
			break;
		}
		
		if (direction == HardwareAbstraction::Out)
		{
			GPIO_InitStruct.GPIO_Mode = GPIO_Mode_AF_PP;
			GPIO_InitStruct.GPIO_Speed = GPIO_Speed_2MHz;

			GPIO_Init(GPIO, &GPIO_InitStruct);
			
			TIM_TimeBaseInitTypeDef timeBaseInit;
			TIM_TimeBaseStructInit(&timeBaseInit);

			//base Init
			timeBaseInit.TIM_Prescaler = std::max(1, (int)ceil(((72 * 1000 * 1000.0) / 65535) * 1));
			timeBaseInit.TIM_CounterMode = TIM_CounterMode_Up;
			timeBaseInit.TIM_Period = (int)ceil(((72 * 1000 * 1000.0) / timeBaseInit.TIM_Prescaler) * 1);
			timeBaseInit.TIM_ClockDivision = 0;
			timeBaseInit.TIM_RepetitionCounter = 0;
			TIM_TimeBaseInit(TIM, &timeBaseInit);

			TIM_OCInitTypeDef outputChannelInit;
			TIM_OCStructInit(&outputChannelInit);
			outputChannelInit.TIM_OCMode = TIM_OCMode_PWM1;
			outputChannelInit.TIM_Pulse = 0;
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

			TIM_Cmd(TIM, ENABLE);

			TIM_CtrlPWMOutputs(TIM, ENABLE);
		}
	}
	
	HardwareAbstraction::PwmValue Stm32F10xPwmService::ReadPin(unsigned char pin)
	{
		
	}
	
	void Stm32F10xPwmService::WritePin(unsigned char pin, HardwareAbstraction::PwmValue value)
	{
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
		}
		
		TIM_TimeBaseInitTypeDef timeBaseInit;
		TIM_TimeBaseStructInit(&timeBaseInit);

		//base Init
		timeBaseInit.TIM_Prescaler = std::max(1, (int)ceil(((72 * 1000 * 1000.0) / 65535) * value.Period));
		timeBaseInit.TIM_CounterMode = TIM_CounterMode_Up;
		timeBaseInit.TIM_Period = (int)ceil(((72 * 1000 * 1000.0) / timeBaseInit.TIM_Prescaler) * value.Period);
		timeBaseInit.TIM_ClockDivision = 0;
		timeBaseInit.TIM_RepetitionCounter = 0;
		TIM_TimeBaseInit(TIM, &timeBaseInit);

		TIM_OCInitTypeDef outputChannelInit;
		TIM_OCStructInit(&outputChannelInit);
		outputChannelInit.TIM_OCMode = TIM_OCMode_PWM1;
		outputChannelInit.TIM_Pulse = value.PulseWidth;
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

		TIM_Cmd(TIM, ENABLE);
	}
}