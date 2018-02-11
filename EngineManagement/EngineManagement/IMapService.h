namespace EngineManagement
{
	class IMapService
	{
	public:
		virtual void ReadMap() = 0;
		float MapKpa;
		float MapKpaDot;
		float MaxMapKpa;
	};
}