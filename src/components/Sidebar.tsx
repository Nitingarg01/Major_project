'use client'
import React, { useEffect, useState } from 'react'
import { MessageCircleQuestion, Trophy, Star, Target, BookOpen, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import Marquee from "react-fast-marquee";
import { useSession } from "next-auth/react";
import { Badge } from './ui/badge';

const Sidebar = ({credits, id}: {credits: number, id: string}) => {
  const { data: session, status } = useSession();
  const [userStats, setUserStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0
  });

  useEffect(() => {
    // Fetch user interview statistics
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/stats');
        if (response.ok) {
          const stats = await response.json();
          setUserStats(stats);
        } else {
          // Fallback to default values if API fails
          setUserStats({
            totalInterviews: 0,
            completedInterviews: 0,
            averageScore: 0
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to default values
        setUserStats({
          totalInterviews: 0,
          completedInterviews: 0,
          averageScore: 0
        });
      }
    };
    
    fetchStats();
  }, [id]);

  const achievements = [
    { icon: Trophy, label: 'First Interview', completed: true },
    { icon: Star, label: '5 Interviews', completed: true },
    { icon: Target, label: '80+ Average Score', completed: true },
    { icon: BookOpen, label: 'All Rounds', completed: false },
  ];

  return (
    <div className='w-full h-full bg-gradient-to-b from-blue-50 to-purple-50'>
      <div className='flex flex-col items-center gap-6 p-4'>
        
        {/* Welcome Section */}
        <div className='flex flex-col items-center mt-6 gap-3 text-center'>
          <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-2'>
            <Users className='w-8 h-8 text-white' />
          </div>
          <span className='bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text font-bold text-2xl'>
            Welcome Back!
          </span>
          <span className='text-gray-600 text-sm'>
            {session?.user?.name || 'Interviewer'}
          </span>
        </div>

        {/* Free Badge */}
        <div className='bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 rounded-full text-center'>
          <span className='font-bold text-lg'>🎉 100% FREE</span>
          <p className='text-xs mt-1'>Unlimited Interviews</p>
        </div>

        {/* Stats Section */}
        <div className='w-full bg-white rounded-lg shadow-sm p-4 space-y-3'>
          <h3 className='font-semibold text-gray-800 text-center mb-3'>Your Progress</h3>
          
          <div className='grid grid-cols-1 gap-3'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>{userStats.totalInterviews}</div>
              <div className='text-xs text-gray-600'>Total Interviews</div>
            </div>
            
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>{userStats.completedInterviews}</div>
              <div className='text-xs text-gray-600'>Completed</div>
            </div>
            
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>{userStats.averageScore}%</div>
              <div className='text-xs text-gray-600'>Avg Score</div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className='w-full bg-white rounded-lg shadow-sm p-4'>
          <h3 className='font-semibold text-gray-800 text-center mb-3'>Achievements</h3>
          <div className='space-y-2'>
            {achievements.map((achievement, index) => (
              <div key={index} className='flex items-center gap-2'>
                <achievement.icon 
                  className={`w-4 h-4 ${achievement.completed ? 'text-yellow-500' : 'text-gray-300'}`} 
                />
                <span className={`text-xs ${achievement.completed ? 'text-gray-700' : 'text-gray-400'}`}>
                  {achievement.label}
                </span>
                {achievement.completed && <Badge variant="secondary" className="text-xs">✓</Badge>}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips */}
        <div className='w-full bg-white rounded-lg shadow-sm p-4'>
          <h3 className='font-semibold text-gray-800 text-center mb-3'>💡 Pro Tips</h3>
          <div className='text-xs text-gray-600 space-y-2'>
            <p>• Practice different interview types</p>
            <p>• Enable camera for real experience</p>
            <p>• Review feedback after each session</p>
            <p>• Try company-specific interviews</p>
          </div>
        </div>

        {/* Motivational Ticker */}
        <div className='w-full'>
          <Marquee speed={30} gradient={false}>
            <span className='text-xs text-gray-500 mr-8'>
              🚀 Keep practicing to improve your interview skills! 
            </span>
            <span className='text-xs text-gray-500 mr-8'>
              💪 Every interview makes you stronger! 
            </span>
            <span className='text-xs text-gray-500 mr-8'>
              🎯 You're getting better with each attempt! 
            </span>
          </Marquee>
        </div>

      </div>
    </div>
  )
}

export default Sidebar