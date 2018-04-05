#include <stm32f10x_gpio.h>
#include <stm32f10x_rcc.h>
#include <stdint.h>
#include "PinDirection.h"
#include "IDigitalService.h"
#include "Stm32F103DigitalService.h"

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
	void Stm32F103DigitalService::InitPin(uint8_t pin, HardwareAbstraction::PinDirection direction)
	{		
		if (pin == 0)
			return;
		pin -= 1;
				
		//PA 0-15
		//PB 16-31
		//PC 32-47
		switch(pin / 8)
		{
		case 0: //PA
			RCC->APB2ENR |= RCC_APB2Periph_GPIOA;
			GPIOA->CRL = (GPIOA->CRL & (0x0F << (pin << 2))) | ((((HardwareAbstraction::PinDirection::In ? GPIO_Mode_IN_FLOATING : GPIO_Mode_Out_PP) & 0x0F) | (HardwareAbstraction::PinDirection::In ? 0 : GPIO_Speed_50MHz)) << (pin << 2));
			break;
		case 1: //PA
			RCC->APB2ENR |= RCC_APB2Periph_GPIOA;
			pin -= 8;
			GPIOA->CRH = (GPIOA->CRH & (0x0F << (pin << 2))) | ((((HardwareAbstraction::PinDirection::In ? GPIO_Mode_IN_FLOATING : GPIO_Mode_Out_PP) & 0x0F) | (HardwareAbstraction::PinDirection::In ? 0 : GPIO_Speed_50MHz)) << (pin << 2));
			break;
		case 2: //PB
			RCC->APB2ENR |= RCC_APB2Periph_GPIOB;
			pin -= 16;
			GPIOB->CRL = (GPIOB->CRL & (0x0F << (pin << 2))) | ((((HardwareAbstraction::PinDirection::In ? GPIO_Mode_IN_FLOATING : GPIO_Mode_Out_PP) & 0x0F) | (HardwareAbstraction::PinDirection::In ? 0 : GPIO_Speed_50MHz)) << (pin << 2));
			break;
		case 3: //PB
			RCC->APB2ENR |= RCC_APB2Periph_GPIOB;
			pin -= 24;
			GPIOB->CRH = (GPIOB->CRH & (0x0F << (pin << 2))) | ((((HardwareAbstraction::PinDirection::In ? GPIO_Mode_IN_FLOATING : GPIO_Mode_Out_PP) & 0x0F) | (HardwareAbstraction::PinDirection::In ? 0 : GPIO_Speed_50MHz)) << (pin << 2));
			break;
		case 4: //PC
			RCC->APB2ENR |= RCC_APB2Periph_GPIOB;
			pin -= 16;
			GPIOC->CRL = (GPIOC->CRL & (0x0F << (pin << 2))) | ((((HardwareAbstraction::PinDirection::In ? GPIO_Mode_IN_FLOATING : GPIO_Mode_Out_PP) & 0x0F) | (HardwareAbstraction::PinDirection::In ? 0 : GPIO_Speed_50MHz)) << (pin << 2));
			break;
		case 5: //PC
			RCC->APB2ENR |= RCC_APB2Periph_GPIOB;
			pin -= 24;
			GPIOC->CRH = (GPIOC->CRH & (0x0F << (pin << 2))) | ((((HardwareAbstraction::PinDirection::In ? GPIO_Mode_IN_FLOATING : GPIO_Mode_Out_PP) & 0x0F) | (HardwareAbstraction::PinDirection::In ? 0 : GPIO_Speed_50MHz)) << (pin << 2));
			break;
		}
	}
	
	bool Stm32F103DigitalService::ReadPin(uint8_t pin)
	{
		if (pin == 0)
			return false;
		pin -= 1;
		
		switch (pin / 16)
		{
		case 0: //PA
			return GPIOA->IDR & PinToGPIO_Pin(pin);
		case 1: //PB
			return GPIOB->IDR & PinToGPIO_Pin(pin - 16);
		case 2: //PC
			return GPIOC->IDR & PinToGPIO_Pin(pin - 32);
		}
	}
	
	void Stm32F103DigitalService::WritePin(uint8_t pin, bool value)
	{
		if (pin == 0)
			return;
		pin -= 1;
		
		switch (pin / 16)
		{
		case 0: //PA
			if(value)
				GPIOA->BRR = PinToGPIO_Pin(pin);
			else
				GPIOA->BSRR = PinToGPIO_Pin(pin);
			break;
		case 1: //PB
			if(value)
				GPIOB->BRR = PinToGPIO_Pin(pin - 16);
			else
				GPIOB->BSRR = PinToGPIO_Pin(pin - 16);
			break;
		case 2: //PC
			if(value)
				GPIOC->BRR = PinToGPIO_Pin(pin - 32);
			else
				GPIOC->BSRR = PinToGPIO_Pin(pin - 32);
			break;
		}
	}
}