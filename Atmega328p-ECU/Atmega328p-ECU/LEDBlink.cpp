#include <avr/io.h>*
#include "Services.h"
#include "PistonEngineFactory.h"
#include "Atmega328pTimerService.h"
#include <stdlib.h>

extern void * operator new(size_t size) { return malloc(size); }
extern void operator delete(void* ptr) { if (ptr) free(ptr); }
extern "C" void __cxa_pure_virtual() { while (1) ; }

void Delay()
{
	long counter = 0;
	while (counter++ < 50000)
		asm("nop");
}

void MainLoop()
{
	DDRB |= (1 << 0);
	EngineManagement::CreateServices(0, 0, 0, 0, 0, true, false, false);
	
	for (;;)
	{
		EngineManagement::ScheduleEvents();
	}
}

int main()
{
	MainLoop();
}