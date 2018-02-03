#include <stm32f10x_gpio.h>
#include <stm32f10x_rcc.h>
#include <stdint.h>
#include "IDigitalService.h"
#include "Stm32F10xDigitalService.h"

unsigned short PinToGPIO_Pin(uint8_t pin)
{
	switch (pin)
	{
	case 0:
		return GPIO_Pin_0;
	case 1:
		return GPIO_Pin_1;
	case 2:
		return GPIO_Pin_2;
	case 3:
		return GPIO_Pin_3;
	case 4:
		return GPIO_Pin_4;
	case 5:
		return GPIO_Pin_5;
	case 6:
		return GPIO_Pin_6;
	case 7:
		return GPIO_Pin_7;
	case 8:
		return GPIO_Pin_8;
	case 9:
		return GPIO_Pin_9;
	case 10:
		return GPIO_Pin_10;
	case 11:
		return GPIO_Pin_11;
	case 12:
		return GPIO_Pin_12;
	case 13:
		return GPIO_Pin_13;
	case 14:
		return GPIO_Pin_14;
	case 15:
		return GPIO_Pin_15;
	}
}

namespace Stm32
{
	void Stm32F10xDigitalService::InitPin(uint8_t pin, HardwareAbstraction::PinDirection direction)
	{
		GPIO_InitTypeDef GPIO_InitStruct;
		GPIO_InitStruct.GPIO_Mode = direction == HardwareAbstraction::PinDirection::In ? GPIO_Mode_IN_FLOATING : GPIO_Mode_Out_PP;
		GPIO_InitStruct.GPIO_Speed = GPIO_Speed_50MHz;
		
		//PA 0-15
		//PB 16-31
		//PC 32-47
		switch (pin / 16)
		{
		case 0: //PA
			GPIO_InitStruct.GPIO_Pin = PinToGPIO_Pin(pin);
			GPIO_Init(GPIOA, &GPIO_InitStruct);
			break;
		case 1: //PB
			GPIO_InitStruct.GPIO_Pin = PinToGPIO_Pin(pin - 16);
			GPIO_Init(GPIOB, &GPIO_InitStruct);
			break;
		case 2: //PC
			GPIO_InitStruct.GPIO_Pin = PinToGPIO_Pin(pin - 32);
			GPIO_Init(GPIOC, &GPIO_InitStruct);
			break;
		}
	}
	
	bool Stm32F10xDigitalService::ReadPin(uint8_t pin)
	{
		switch (pin / 16)
		{
		case 0: //PA
			return GPIO_ReadInputDataBit(GPIOA, PinToGPIO_Pin(pin)) > 0;
		case 1: //PB
			return GPIO_ReadInputDataBit(GPIOB, PinToGPIO_Pin(pin - 16)) > 0;
		case 2: //PC
			return GPIO_ReadInputDataBit(GPIOC, PinToGPIO_Pin(pin - 32)) > 0;
		}
	}
	
	void Stm32F10xDigitalService::WritePin(uint8_t pin, bool value)
	{
		BitAction action = value ? BitAction::Bit_SET : BitAction::Bit_RESET;
		
		switch (pin / 16)
		{
		case 0: //PA
			GPIO_WriteBit(GPIOA, PinToGPIO_Pin(pin), action);
			break;
		case 1: //PB
			GPIO_WriteBit(GPIOB, PinToGPIO_Pin(pin - 16), action);
			break;
		case 2: //PC
			GPIO_WriteBit(GPIOC, PinToGPIO_Pin(pin - 32), action);
			break;
		}
	}
}