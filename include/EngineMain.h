#include "EmbeddedIOServiceCollection.h"

#ifndef ENGINEMAIN_H
#define ENGINEMAIN_H
namespace Engine
{
	class EngineMain
	{
		static void Start(EmbeddedIOServices::EmbeddedIOServiceCollection *embeddedIOServiceCollection, const void *config, unsigned int &sizeOut);
	};
}
#endif